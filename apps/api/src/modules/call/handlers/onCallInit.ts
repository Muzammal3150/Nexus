import type { Socket } from "socket.io";
import { z } from "zod";
import prisma from "../../../config/prisma.js";
import { CallEvents } from "../events.js";
import type { CallContext, CallRoom } from "../types.js";

const MAX_CALL_MEMBERS = 20;

const callInitPayloadSchema = z.object({
    memberIds: z.array(
        z.string().trim().min(1, "Invalid user id"),
    ).max(
        MAX_CALL_MEMBERS,
        `Cannot start a call with more than ${MAX_CALL_MEMBERS} members`,
    ),
});

type CallInitPayload = z.infer<typeof callInitPayloadSchema>;

async function validate(
    socket: Socket,
    data: unknown,
): Promise<CallInitPayload | null> {
    const result = callInitPayloadSchema.safeParse(data);

    if (!result.success) {
        socket.emit(CallEvents.Error, {
            message: result.error.issues[0]?.message ?? "Invalid call payload",
        });
        return null;
    }

    const memberIds = [...new Set(result.data.memberIds)].filter(
        (id) => id !== socket.data.user.id,
    );

    if (memberIds.length === 0) {
        socket.emit(CallEvents.Error, {
            message: "You must invite at least one other valid user",
        });
        return null;
    }

    try {
        const existingUsers = await prisma.user.findMany({
            where: { id: { in: memberIds } },
            select: { id: true },
        });

        const existingIds = new Set(existingUsers.map((user) => user.id));
        const missingIds = memberIds.filter((id) => !existingIds.has(id));

        if (missingIds.length > 0) {
            socket.emit(CallEvents.Error, {
                message: `Some invited users could not be found: ${missingIds.join(", ")}`,
            });
            return null;
        }
    } catch (error) {
        console.error("Error validating call members:", error);

        socket.emit(CallEvents.Error, {
            message: "Failed to validate call members, please try again",
        });
        return null;
    }

    return { memberIds };
}

export async function onCallInit(
    ctx: CallContext,
    socket: Socket,
    data: unknown,
    callback: (response: { success: boolean; room?: CallRoom }) => void
) {
    const payload = await validate(socket, data);
    if (!payload) return;

    let newRoom;

    try {
        newRoom = ctx.callManager.createRoom(
            payload.memberIds,
            socket.data.user,
        );
    } catch (error) {
        console.error("Error creating call room:", error);

        socket.emit(CallEvents.Error, {
            message: "Failed to create call room, please try again",
        });

        return;
    }

    socket.join(newRoom.id);

    for (const memberId of newRoom.memberIds) {
        if (memberId === socket.data.user.id) continue;

        ctx.io.to(`user:${memberId}`).emit(
            CallEvents.InviteBroadcast,
            newRoom,
        );
    }

    // Keep the callback if your client expects call initialization acknowledgement.
    callback?.({
        success: true,
        room: newRoom,
    });
}