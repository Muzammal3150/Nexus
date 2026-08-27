import type { Socket } from "socket.io";
import { z } from "zod";
import { redis } from "../../../config/redis.js";
import { ChatEvents } from "../../../modules/chat/events.js";

const messageReceivePayloadSchema = z.object({
    streamId: z.string().min(1, "A valid streamId is required"),
    roomId: z.string().trim().min(1, "A valid roomId is required"),
});



export async function onMessageReceived(socket: Socket, data: unknown) {
    const payload = await validate(socket, data);
    if (!payload) return;

    const { roomId, streamId } = payload;

    await redis.hSet(`nexus:chat:sync:${roomId}`, socket.data.session.id, streamId);
}



async function validate(socket: Socket, data: unknown) {
    const result = messageReceivePayloadSchema.safeParse(data);

    if (!result.success) {
        socket.emit(ChatEvents.Error, {
            message: result.error.issues[0]?.message ?? "Invalid message",
        });
        return null;
    }

    if (!socket.data.user?.id) {
        socket.emit(ChatEvents.Error, {
            message: "You are not authenticated",
        });
        return null;
    }

    const { roomId, streamId } = result.data;

    if (!socket.rooms.has(`room:${roomId}`)) {
        socket.emit(ChatEvents.Error, {
            message: "You are not a member of this room",
        });
        return null;
    }

    const message = await redis.xRange(`nexus:chat:room:${roomId}`, streamId, streamId);

    if (message.length === 0) {
        socket.emit(ChatEvents.Error, {
            message: "Message does not exist",
        });
        return null;
    }

    return result.data;
}
