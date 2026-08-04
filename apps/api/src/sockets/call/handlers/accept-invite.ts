
import type { Socket } from "socket.io";
import { CallEvents } from "../events.js";
import { safeAck } from "../safeAck.js";
import type { CallContext } from "../types.js";

interface RoomActionPayload {
    roomId: string;
}


export async function onCallAccept(ctx: CallContext, socket: Socket, data: unknown, callback?: unknown) {
    const payload = data as Partial<RoomActionPayload> | undefined;

    if (!payload || typeof payload.roomId !== "string" || !payload.roomId.trim()) {
        const errMsg = { message: "A valid roomId is required" };
        socket.emit(CallEvents.Error, errMsg);
        return safeAck(callback, { success: false, ...errMsg });
    }

    let room;
    try {
        room = ctx.callManager.accept(payload.roomId, socket.data.user);

    } catch (err) {
        console.error(`Error accepting call ${payload.roomId}:`, err);
        socket.emit(CallEvents.Error, { message: "Failed to accept call" });
        return safeAck(callback, { success: false, message: "Failed to accept call" });
    }

    if (!room) {
        socket.emit(CallEvents.Error, { message: "Call room not found" });
        return safeAck(callback, { success: false, message: "Call room not found" });
    }

    console.log("call accepted", room.id);
    
    socket.join(room.id);
    socket.to(room.id).emit(CallEvents.AcceptBroadcast, { user: socket.data.user });
    safeAck(callback, { success: true, room });
}
