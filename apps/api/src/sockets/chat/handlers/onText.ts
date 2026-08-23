import type { Socket } from "socket.io";
import { z } from "zod";
import { ChatEvents } from "../events.js";
import { redis } from "../../../config/redis.js";

const maxMessageLength = 4000;

const textPayloadSchema = z.object({
    roomId: z.string().trim().min(1, "A valid roomId is required"),
    text: z.string().trim().min(1, "Message cannot be empty").max(maxMessageLength, "Message is too long"),
});

type TextPayload = z.infer<typeof textPayloadSchema>;

function validate(socket: Socket, data: unknown): TextPayload | null {
    if (!socket.data.user?.id) {
        socket.emit(ChatEvents.Error, {
            message: "You are not authenticated",
        });
        return null;
    }

    const result = textPayloadSchema.safeParse(data);

    if (!result.success) {
        socket.emit(ChatEvents.Error, {
            message: result.error.issues[0]?.message ?? "Invalid message",
        });
        return null;
    }

    if (!socket.rooms.has(`room:${result.data.roomId}`)) {
        socket.emit(ChatEvents.Error, {
            message: "You are not a member of this room",
        });
        return null;
    }

    return result.data;
}

export async function onText(socket: Socket, data: unknown) {
    const payload = validate(socket, data);
    if (!payload) return;

    const { roomId, text } = payload;

    const messagePayload = {
        id: crypto.randomUUID(),
        sender: socket.data.user,
        text,
        sentAt: Date.now(),
        roomId,
    };

    const streamId = await redis.xAdd(`nexus:chat:room:${roomId}`, "*", {
        event: "chat:text",
        payload: JSON.stringify(messagePayload),
    });

    socket.to(`room:${roomId}`).emit(ChatEvents.Chat.Text, {
        streamId,
        ...messagePayload,
    });

    socket.emit(ChatEvents.Chat.Text, {
        ...messagePayload,
        isMine: true,
        streamId,
    });

    await redis.hSet(`nexus:chat:sync:${roomId}`, socket.data.session.id, streamId);
}