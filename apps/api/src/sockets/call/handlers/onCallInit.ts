import type { Socket } from "socket.io";
import prisma from "../../../config/prisma.js";
import { CallEvents } from "../events.js";
import { safeAck } from "../safeAck.js";
import type { CallContext } from "../types.js";

interface CallInitPayload {
    memberIds: string[];
}

const MAX_CALL_MEMBERS = 20;

export async function onCallInit(ctx: CallContext, socket: Socket, data: unknown, callback: unknown) {
    const payload = data as Partial<CallInitPayload> | undefined;

    if (!payload || !Array.isArray(payload.memberIds)) {
        return safeAck(callback, {
            success: false,
            error: "memberIds must be an array of user ids",
        });
    }

    // Dedupe, drop non-strings/empties, and never let a caller invite themselves.
    const memberIds = Array.from(
        new Set(payload.memberIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0))
    ).filter((id) => id !== socket.data.user.id);

    if (memberIds.length === 0) {
        return safeAck(callback, {
            success: false,
            error: "You must invite at least one other valid user",
        });
    }

    if (memberIds.length > MAX_CALL_MEMBERS) {
        return safeAck(callback, {
            success: false,
            error: `Cannot start a call with more than ${MAX_CALL_MEMBERS} members`,
        });
    }

    // Verify invited users actually exist before creating a room and paging them.
    let existingUsers;
    try {
        existingUsers = await prisma.user.findMany({
            where: { id: { in: memberIds } },
            select: { id: true },
        });
    } catch (err) {
        console.error("Error validating call members:", err);
        return safeAck(callback, {
            success: false,
            error: "Failed to validate call members, please try again",
        });
    }

    const existingIds = new Set(existingUsers.map((u) => u.id));
    const missingIds = memberIds.filter((id) => !existingIds.has(id));

    if (missingIds.length > 0) {
        return safeAck(callback, {
            success: false,
            error: `Some invited users could not be found: ${missingIds.join(", ")}`,
        });
    }

    let newRoom;
    try {
        newRoom = ctx.callManager.createRoom(memberIds, socket.data.user);
    } catch (err) {
        console.error("Error creating call room:", err);
        return safeAck(callback, {
            success: false,
            error: "Failed to create call room, please try again",
        });
    }

    for (const memberId of newRoom.memberIds) {
        if (memberId === socket.data.user.id) continue;
        try {
            ctx.io.to(`user:${memberId}`).emit(CallEvents.InviteBroadcast, newRoom);
        } catch (err) {
            console.error(`Failed to notify user ${memberId} of new call ${newRoom.id}:`, err);
        }
    }

    try {
        socket.join(newRoom.id);
    } catch (err) {
        console.error(`Failed to join creator's socket to room ${newRoom.id}:`, err);
    }

    return safeAck(callback, { success: true, room: newRoom });
}