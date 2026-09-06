import type { Socket } from "socket.io";
import { z } from "zod";
import { CallEvents } from "../events.js";
import type { CallContext } from "../types.js";
import { serializeRoom } from "./onGetRoom.js";

const roomActionPayloadSchema = z.object({
    roomId: z.string().trim().min(1, "A valid roomId is required"),
});

type CallRejectCallback = (response: { success: true }) => void;

function validate(socket: Socket, data: unknown){
    const result = roomActionPayloadSchema.safeParse(data);

    if (!result.success) {
        socket.emit(CallEvents.Error, {
            message: result.error.issues[0]?.message ?? "Invalid room payload",
        });
        return null;
    }

    return result.data;
}

export async function onCallReject(ctx: CallContext, socket: Socket, data: unknown, callback?: CallRejectCallback) {
    const payload = validate(socket, data);
    if (!payload) return;

    let room;

    try {
        room =  ctx.callManager.reject(payload.roomId, socket.data.user);
    } catch (error) {
        console.error(`Error rejecting call ${payload.roomId}:`, error);

        socket.emit(CallEvents.Error, { message: "Failed to reject call" });
        return;
    }

    if (!room) {
        socket.emit(CallEvents.Error, { message: "Call room not found" });
        return;
    }

    ctx.io.to(room.id).emit(CallEvents.RejectBroadcast, { user: socket.data.user });
    ctx.io.to(room.id).emit(CallEvents.Sync, { room: serializeRoom(room) });
    callback?.({ success: true });
}