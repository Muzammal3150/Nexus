import type { Socket } from "socket.io";
import { CallEvents } from "../events.js";
import { safeAck } from "../safeAck.js";
import type { CallContext } from "../types.js";

interface RTCOfferPayload {
    targetId: string;
    roomId: string;
    offer: RTCSessionDescriptionInit;
}

export async function onRTCOffer(
    ctx: CallContext,
    socket: Socket,
    data: unknown,
    callback?: unknown,
) {
    const payload = data as Partial<RTCOfferPayload> | undefined;

    if (
        !payload ||
        typeof payload.roomId !== "string" ||
        !payload.roomId.trim() ||
        typeof payload.targetId !== "string"
    ) {
        const message = "A valid roomId and targetId are required.";

        socket.emit(CallEvents.Error, { message });

        return safeAck(callback, {
            success: false,
            message,
        });
    }

    // Sender must be in the room
    const isSenderInRoom = ctx.callManager.hasAccepted(payload.roomId, socket.data.user.id)
    const isTargetInRoom = ctx.callManager.hasAccepted(payload.roomId, payload.targetId)
    console.log(ctx.callManager.getRoom(payload.roomId), payload.targetId, isSenderInRoom, isTargetInRoom)

    if (!isSenderInRoom || !isTargetInRoom) {
        const message =
            "Failed to create offer: Both members are not in the same room.";

        socket.emit(CallEvents.Error, { message });

        return safeAck(callback, {
            success: false,
            message,
        });
    }
    console.log("Invite sended to ", payload.targetId)
    ctx.io.to(`user:${payload.targetId}`).emit(
        CallEvents.OfferBroadcast,
        {
            sender: socket.data.user,
            roomId: payload.roomId,
            offer: payload.offer,
            sentAt: new Date(),
        },
    );

    return safeAck(callback, {
        success: true,
    });
}