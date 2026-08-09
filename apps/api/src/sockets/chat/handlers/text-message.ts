import type { Socket } from "socket.io";
import { ChatEvents } from "../events.js";

const MAX_MESSAGE_LENGTH = 4000;


interface TextPayload {
    roomId: string;
    text: string;
}


export function onText(socket: Socket, data: unknown) {
    const payload = data as Partial<TextPayload> | undefined;

    if (!payload || typeof payload.roomId !== "string" || !payload.roomId.trim()) {
        socket.emit(ChatEvents.Error, { message: "A valid roomId is required" });
        return;
    }

    if (typeof payload.text !== "string" || !payload.text.trim()) {
        socket.emit(ChatEvents.Error, { message: "Message body cannot be empty" });
        return;
    }

    const text = payload.text.trim().slice(0, MAX_MESSAGE_LENGTH);


    if (!socket.rooms.has(payload.roomId)) {
        socket.emit(ChatEvents.Error, { message: "You are not a member of this room" });
        return;
    }

    const messagePayload = {
        id: crypto.randomUUID(),
        sender: socket.data.user,
        text,
        sentAt: Date.now(),
        roomId: payload.roomId,
    };

    try {
        socket.to(payload.roomId).emit(ChatEvents.Chat.Text, messagePayload);
        socket.emit(ChatEvents.Chat.Text, { ...messagePayload, isMine: true });
    } catch (err) {
        console.error(`Failed to broadcast message to room ${payload.roomId}:`, err);
        socket.emit(ChatEvents.Error, { message: "Failed to send message" });
    }
}