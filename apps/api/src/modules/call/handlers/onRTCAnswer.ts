import type { Socket } from "socket.io";
import { z } from "zod";

import { CallEvents } from "../events.js";
import { safeAck } from "../safeAck.js";
import type { CallContext } from "../types.js";

const rtcSessionDescriptionSchema = z.object({
    type: z.enum(["offer", "answer", "pranswer", "rollback"]),
    sdp: z.string().optional(),
});

const rtcAnswerSchema = z.object({
    targetId: z.string().trim().min(1),
    roomId: z.string().trim().min(1),
    answer: rtcSessionDescriptionSchema,
});


export async function onRTCAnswer(
    ctx: CallContext,
    socket: Socket,
    data: unknown,
    callback?: unknown,
) {
    const result = rtcAnswerSchema.safeParse(data);

    if (!result.success) {
        const message = "A valid roomId, targetId, and answer are required.";

        socket.emit(CallEvents.Error, { message });

        return safeAck(callback, {
            success: false,
            message,
        });
    }

    const { roomId, targetId, answer } = result.data;
    const userId = socket.data.user.id;

    const isSenderInRoom = ctx.callManager.hasJoined(roomId, userId);
    const isTargetInRoom = ctx.callManager.hasJoined(roomId, targetId);

    if (!isSenderInRoom || !isTargetInRoom) {
        const message = "Both members must be in the same room.";

        socket.emit(CallEvents.Error, { message });

        return safeAck(callback, {
            success: false,
            message,
        });
    }

    ctx.io.to(`user:${targetId}`).emit(CallEvents.AnswerBroadcast, {
        sender: socket.data.user,
        roomId,
        answer,
        sentAt: new Date(),
    });

    return safeAck(callback, {
        success: true,
    });
}