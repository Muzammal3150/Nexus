import type { Socket } from "socket.io";
import { z } from "zod";
import { CallEvents } from "../events.js";
import type { CallContext, CallRoom } from "../types.js";
import { serializeRoom } from "./onGetRoom.js";

const roomActionPayloadSchema = z.object({
    roomId: z.string().trim().min(1, "A valid roomId is required"),
});

type RoomActionPayload = z.infer<typeof roomActionPayloadSchema>;
type CallAcceptCallback = (response: { success: true; room: CallRoom }) => void;

function validate(socket: Socket, data: unknown): RoomActionPayload | null {
    const result = roomActionPayloadSchema.safeParse(data);

    if (!result.success) {
        socket.emit(CallEvents.Error, { message: result.error.issues[0]?.message ?? "Invalid room payload" });
        return null;
    }

    return result.data;
}

export async function onCallAccept(ctx: CallContext, socket: Socket, data: unknown, callback?: CallAcceptCallback) {
    const payload = validate(socket, data);
    if (!payload) return;

    let room;

    try {
        room = ctx.callManager.accept(payload.roomId, socket.data.user);
    } catch (error) {
        console.error(`Error accepting call ${payload.roomId}:`, error);

        socket.emit(CallEvents.Error, { message: "Failed to accept call" });
        return;
    }

    if (!room) {
        socket.emit(CallEvents.Error, { message: "Call room not found" });
        return;
    }

    socket.join(room.id);

    ctx.io.to(room.id).emit(CallEvents.Sync, { room: serializeRoom(room) });

    callback?.({ success: true, room });
}