import type { Socket } from "socket.io";
import { CallEvents } from "../events.js";
import { safeAck } from "../safeAck.js";
import type { CallContext } from "../types.js";
interface RoomActionPayload {
    roomId: string;
}

export async function onCallLeave(ctx: CallContext, socket: Socket, data: unknown, cb?: unknown) {
    const payload = data as Partial<RoomActionPayload> | undefined;

    if (!payload || typeof payload.roomId !== "string" || !payload.roomId.trim()) {
        return safeAck(cb, { success: false, message: "A valid roomId is required" });
    }

    console.log(socket.data.user.name, payload.roomId, "left");

    let room;
    try {
        room = ctx.callManager.leave(payload.roomId, socket.data.user);
    } catch (err) {
        console.error(`Error leaving call ${payload.roomId}:`, err);
        return safeAck(cb, { success: false, message: "Failed to leave call" });
    }

    if (!room) {
        // Room may already be gone or the user was never in it — not an error to the client.
        return safeAck(cb, { success: true, alreadyGone: true });
    }

    try {
        socket.leave(room.id);
    } catch (err) {
        console.error(`Failed to leave socket room ${room.id}:`, err);
    }

    ctx.io.to(room.id).emit(CallEvents.LeaveBroadcast, { user: socket.data.user });

    if (room.joinedUserIds.size === 0) {
        try {
            ctx.callManager.removeRoom(room.id);
        } catch (err) {
            console.error(`Failed to remove empty room ${room.id}:`, err);
        }
    }

    safeAck(cb, { success: true });
}