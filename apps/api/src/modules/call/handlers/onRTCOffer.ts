import type { Socket } from "socket.io";
import { z } from "zod";

import { CallEvents } from "../events.js";
import { safeAck } from "../safeAck.js";
import type { CallContext } from "../types.js";

const rtcSessionDescriptionSchema = z.object({
    type: z.enum(["offer", "answer", "pranswer", "rollback"]),
    sdp: z.string().optional(),
});

const rtcOfferSchema = z.object({
    targetId: z.string().trim().min(1),
    roomId: z.string().trim().min(1),
    offer: rtcSessionDescriptionSchema,
});

export async function onRTCOffer(
    ctx: CallContext,
    socket: Socket,
    data: unknown,
    callback?: unknown,
) {
    const result = rtcOfferSchema.safeParse(data);

    if (!result.success) {
        const message = "A valid roomId, targetId, and offer are required.";

        socket.emit(CallEvents.Error, { message });

        return safeAck(callback, {
            success: false,
            message,
        });
    }

    const { roomId, targetId, offer } = result.data;
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

    ctx.io.to(`user:${targetId}`).emit(CallEvents.OfferBroadcast, {
        sender: socket.data.user,
        roomId,
        offer,
        sentAt: new Date(),
    });

    return safeAck(callback, {
        success: true,
    });
}