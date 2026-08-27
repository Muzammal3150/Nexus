import type { Socket } from "socket.io";
import { z } from "zod";

import { CallEvents } from "../events.js";
import { safeAck } from "../safeAck.js";
import type { CallContext } from "../types.js";

const rtcIceCandidateSchema = z.object({
    targetId: z.string().trim().min(1),
    roomId: z.string().trim().min(1),
    candidate: z.object({
        candidate: z.string(),
        sdpMid: z.string().nullable().optional(),
        sdpMLineIndex: z.number().int().nullable().optional(),
        usernameFragment: z.string().nullable().optional(),
    }),
});


export async function onRTCIceCandidate(
    ctx: CallContext,
    socket: Socket,
    data: unknown,
    callback?: unknown,
) {
    const result = rtcIceCandidateSchema.safeParse(data);

    if (!result.success) {
        const message = "A valid roomId, targetId, and ICE candidate are required.";

        socket.emit(CallEvents.Error, { message });

        return safeAck(callback, {
            success: false,
            message,
        });
    }

    const { roomId, targetId, candidate } = result.data;
    const userId = socket.data.user.id;

    const isSenderInRoom = ctx.callManager.hasAccepted(roomId, userId);
    const isTargetInRoom = ctx.callManager.hasAccepted(roomId, targetId);

    if (!isSenderInRoom || !isTargetInRoom) {
        const message = "Both members must be in the same room.";

        socket.emit(CallEvents.Error, { message });

        return safeAck(callback, {
            success: false,
            message,
        });
    }

    ctx.io.to(`user:${targetId}`).emit(
        CallEvents.IceCandidateBroadcast,
        {
            sender: socket.data.user,
            roomId,
            candidate,
            sentAt: new Date(),
        },
    );

    return safeAck(callback, {
        success: true,
    });
}