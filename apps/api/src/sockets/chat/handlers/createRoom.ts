import type { Socket } from "socket.io";

import prisma from "../../../config/prisma.js";
import { ChatEvents } from "../events.js";
import { safeAck } from "../safeAck.js";
import type { ChatContext } from "../types.js";

import type { Room } from "../../../generated/prisma/client.js";
import type { User } from "../../../config/auth.js";

interface CreateRoomPayload {
    name: string;
    memberIds: string[];
    isGroup: boolean;
}

type RoomWithMembers = Room & {
    members: (RoomMember & { user?: User })[];
};

/** Discriminated result type so each validation/lookup step can short-circuit cleanly. */
type StepResult<T> = { ok: true; value: T } | { ok: false; error: string };

const MAX_GROUP_MEMBERS = 200;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** Narrows unknown socket data into a usable payload, or returns why it can't. */
function parsePayload(data: unknown): StepResult<CreateRoomPayload> {
    const payload = data as Partial<CreateRoomPayload> | undefined;

    if (!payload || !Array.isArray(payload.memberIds)) {
        return { ok: false, error: "memberIds must be an array of user ids" };
    }

    if (typeof payload.isGroup !== "boolean") {
        return { ok: false, error: "isGroup must be a boolean" };
    }

    if (payload.isGroup && (typeof payload.name !== "string" || !payload.name.trim())) {
        return { ok: false, error: "Group chats require a name" };
    }

    return {
        ok: true,
        value: {
            name: payload.name ?? "",
            memberIds: payload.memberIds,
            isGroup: payload.isGroup,
        },
    };
}

/** Dedupes, drops junk entries, and guarantees the creator is included. */
function resolveMemberIds(rawMemberIds: string[], creatorId: string): string[] {
    return Array.from(
        new Set(
            [...rawMemberIds, creatorId].filter(
                (id): id is string => typeof id === "string" && id.trim().length > 0
            )
        )
    );
}

/** Checks member-count rules that depend on isGroup. */
function validateMemberCount(memberIds: string[], isGroup: boolean): StepResult<true> {
    if (memberIds.length < 2) {
        return { ok: false, error: "A room needs at least one other member" };
    }

    if (!isGroup && memberIds.length !== 2) {
        return { ok: false, error: "Direct messages must have exactly two members" };
    }

    if (isGroup && memberIds.length > MAX_GROUP_MEMBERS) {
        return { ok: false, error: `A group cannot have more than ${MAX_GROUP_MEMBERS} members` };
    }

    return { ok: true, value: true };
}

// ---------------------------------------------------------------------------
// Data lookups
// ---------------------------------------------------------------------------

/** Confirms every memberId corresponds to a real user. */
async function verifyMembersExist(memberIds: string[]): Promise<StepResult<true>> {
    let existingUsers;
    try {
        existingUsers = await prisma.user.findMany({
            where: { id: { in: memberIds } },
            select: { id: true },
        });
    } catch (err) {
        console.error("Error validating room members:", err);
        return { ok: false, error: "Failed to validate members, please try again" };
    }

    const existingIds = new Set(existingUsers.map((u) => u.id));
    const missingIds = memberIds.filter((id) => !existingIds.has(id));

    if (missingIds.length > 0) {
        return { ok: false, error: `Some members could not be found: ${missingIds.join(", ")}` };
    }

    return { ok: true, value: true };
}

/** Looks up a pre-existing 1:1 room between exactly these two members, if any. */
async function findExistingDirectRoom(memberIds: [string, string]) {
    try {
        const room = await prisma.room.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { members: { some: { userId: memberIds[0] } } },
                    { members: { some: { userId: memberIds[1] } } },
                ],
            },
            include: { members: true },
        });

        const isExactMatch =
            !!room &&
            room.members.length === 2 &&
            room.members.some((m) => m.userId === memberIds[0]) &&
            room.members.some((m) => m.userId === memberIds[1]);

        return { ok: true, value: isExactMatch ? room : null };
    } catch (err) {
        console.error("Error checking for existing direct message room:", err);
        return { ok: false, error: "Failed to check existing conversations, please try again" };
    }
}


async function persistRoom(payload: CreateRoomPayload, memberIds: string[]) {
    try {
        const room = await prisma.room.create({
            data: {
                name: payload.isGroup ? payload.name.trim() : payload.name?.trim(),
                isGroup: payload.isGroup,
                members: {
                    create: memberIds.map((userId) => ({
                        user: { connect: { id: userId } },
                        role: "client",
                    })),
                },
            },
            include: {
                members: { include: { user: true } },
            },
        });
        return { ok: true, value: room };
    } catch (err) {
        console.error("Error creating room:", err);
        return { ok: false, error: "Failed to create room, please try again" };
    }
}

// ---------------------------------------------------------------------------
// Side effects (sockets)
// ---------------------------------------------------------------------------

/**
 * Joins every currently-connected member's sockets to the new room server-side
 * (so onText's membership check works immediately) and notifies them.
 */
async function notifyNewRoomMembers(ctx: ChatContext, room: RoomWithMembers) {
    await Promise.all(room.members.map(async (member) => {
        try {
            const sockets = await ctx.io.in(`user:${member.userId}`).fetchSockets();
            sockets.forEach((s) => s.join(room.id));
        } catch (err) {
            console.error(`Failed to join user ${member.userId} to new room ${room.id}:`, err);
        }

        try {
            ``
            ctx.io.to(`user:${member.userId}`).emit(ChatEvents.Room.CreateBroadcast, room);
        } catch (err) {
            console.error(`Failed to notify user ${member.userId} of new room ${room.id}:`, err);
        }
    })
    );
}





export async function createRoom(ctx: ChatContext, socket: Socket, data: unknown, callback: unknown) {
    const parsed = parsePayload(data);
    if (!parsed.ok) {
        return safeAck(callback, { success: false, error: parsed.error });
    }
    const payload = parsed.value;

    const memberIds = resolveMemberIds(payload.memberIds, socket.data.user.id);
    const countCheck = validateMemberCount(memberIds, payload.isGroup);

    if (!countCheck.ok) return safeAck(callback, { success: false, error: countCheck.error });

    const membersExist = await verifyMembersExist(memberIds);
    if (!membersExist.ok) return safeAck(callback, { success: false, error: membersExist.error });

    if (!payload.isGroup) {
        const existing = await findExistingDirectRoom(memberIds as [string, string]);
        if (!existing.ok) return safeAck(callback, { success: false, error: existing.error });

        if (existing.value) {
            socket.join(existing.value.id);
            return safeAck(callback, { success: true, alreadyExists: true, room: existing.value });
        }
    }

    const created = await persistRoom(payload, memberIds);
    if (!created.ok) return safeAck(callback, { success: false, error: created.error });


    await notifyNewRoomMembers(ctx, created.value);

    return safeAck(callback, { success: true, room: created.value });
}