import type { Socket } from "socket.io";
import { ChatEvents } from "../events.js";
import { redis } from "../../../config/redis.js";

const maxMessageLength = 4000;

interface TextPayload {
    roomId: string;
    text: string;
}

function validate(socket: Socket, data: unknown) {

    if (
        typeof data !== "object" ||
        data === null ||
        !("roomId" in data) ||
        !("text" in data) ||
        typeof data.roomId !== "string" ||
        typeof data.text !== "string"
    ) {
        socket.emit(ChatEvents.Error, { message: "Invalid message" });
        return;
    }

    const { roomId, text } = data as TextPayload;

    if (!roomId.trim() || !text.trim()) {
        socket.emit(ChatEvents.Error, { message: "Invalid message" });
        return;
    }

    if (!socket.rooms.has(roomId)) {
        socket.emit(ChatEvents.Error, {
            message: "You are not a member of this room",
        });
        return;
    }

    return data as TextPayload
}


export async function onText(socket: Socket, data: unknown) {
    const payload = validate(socket, data)
    if (!payload) return;

    const { text, roomId } = payload
    const messagePayload = {
        id: crypto.randomUUID(),
        sender: socket.data.user,
        text: text.slice(0, maxMessageLength),
        sentAt: Date.now(),
        roomId,
    };

    const streamId = await redis.xAdd(`nexus:chat:room:${roomId}`, '*', {
        event: "chat:text",
        payload: JSON.stringify(messagePayload),
    })
    await redis.hSet(
        `nexus:chat:sync:${roomId}`,
        socket.data.session.id,
        streamId,
    );

    socket.to(roomId).emit(ChatEvents.Chat.Text, { ...messagePayload, streamId });
    socket.emit(ChatEvents.Chat.Text, {
        ...messagePayload,
        isMine: true,
        streamId,
    });
}