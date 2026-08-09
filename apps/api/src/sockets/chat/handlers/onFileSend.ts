import type { Socket } from "socket.io";
import { ChatEvents } from "../events.js";

interface FilePayload {
    roomId: string;
    attachment: {
        id: string;
        filename: string;
        originalFilename: string;
        mimeType: string;
        size: number;
    };
}

function validate(socket: Socket, data: unknown) {
    if (typeof data !== "object" || data === null) {
        socket.emit(ChatEvents.Error, { message: "Invalid file payload" });
        return;
    }

    const payload = data as Partial<FilePayload>;

    if (typeof payload.roomId !== "string" || !payload.roomId.trim()) {
        socket.emit(ChatEvents.Error, { message: "A valid roomId is required" });
        return;
    }

    if (!socket.rooms.has(payload.roomId)) {
        socket.emit(ChatEvents.Error, {
            message: "You are not a member of this room",
        });
        return;
    }

    if (typeof payload.attachment !== "object" || payload.attachment === null) {
        socket.emit(ChatEvents.Error, { message: "Invalid file" });
        return;
    }

    const attachment = payload.attachment;

    if (
        typeof attachment.id !== "string" ||
        typeof attachment.filename !== "string" ||
        typeof attachment.originalFilename !== "string" ||
        typeof attachment.mimeType !== "string" ||
        typeof attachment.size !== "number" ||
        !Number.isFinite(attachment.size) ||
        attachment.size < 0
    ) {
        socket.emit(ChatEvents.Error, { message: "Invalid file" });
        return;
    }

    return payload as FilePayload;
}

export function onFileSend(socket: Socket, data: unknown) {
    const payload = validate(socket, data);
    if (!payload) return;
    console.log("File send")

    const { roomId, attachment } = payload;

    const messagePayload = {
        id: crypto.randomUUID(),
        sender: socket.data.user,
        attachment,
        sentAt: Date.now(),
        roomId,
    };
    socket.to(roomId).emit(ChatEvents.Chat.File, messagePayload);
    socket.emit(ChatEvents.Chat.File, {
        ...messagePayload,
        isMine: true,
    });
}