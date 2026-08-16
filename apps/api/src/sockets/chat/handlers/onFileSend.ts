import type { Socket } from "socket.io";
import { ChatEvents } from "../events.js";
import { redis } from "../../../config/redis.js";

interface FilePayload {
    id: string;
    roomId: string;
    attachment: {
        fileId: string;
        filename: string;
        originalFilename: string;
        mimeType: string;
        size: number;
    };
}

function validate(socket: Socket, data: unknown): FilePayload | null {
    if (typeof data !== "object" || data === null) {
        socket.emit(ChatEvents.Error, { message: "Invalid file payload" });
        return null;
    }

    const payload = data as Record<string, unknown>;

    if (typeof payload.id !== "string" || !payload.id.trim()) {
        socket.emit(ChatEvents.Error, { message: "A valid message id is required" });
        return null;
    }

    if (typeof payload.roomId !== "string" || !payload.roomId.trim()) {
        socket.emit(ChatEvents.Error, { message: "A valid roomId is required" });
        return null;
    }

    if (!socket.rooms.has(payload.roomId)) {
        socket.emit(ChatEvents.Error, { message: "You are not a member of this room" });
        return null;
    }

    if (typeof payload.attachment !== "object" || payload.attachment === null) {
        socket.emit(ChatEvents.Error, { message: "Invalid file" });
        return null;
    }

    const attachment = payload.attachment as Record<string, unknown>;

    if (
        typeof attachment.fileId !== "string" ||
        !attachment.fileId.trim() ||
        typeof attachment.filename !== "string" ||
        typeof attachment.originalFilename !== "string" ||
        typeof attachment.mimeType !== "string" ||
        typeof attachment.size !== "number" ||
        !Number.isFinite(attachment.size) ||
        attachment.size < 0
    ) {
        socket.emit(ChatEvents.Error, { message: "Invalid file" });
        return null;
    }

    return {
        id: payload.id,
        roomId: payload.roomId,
        attachment: {
            fileId: attachment.fileId,
            filename: attachment.filename,
            originalFilename: attachment.originalFilename,
            mimeType: attachment.mimeType,
            size: attachment.size,
        },
    };
}

export async function onFileSend(socket: Socket, data: unknown) {
    const payload = validate(socket, data);
    if (!payload) return;

    const { id, roomId, attachment } = payload;

    const messagePayload = {
        id,
        sender: socket.data.user,
        attachment,
        sentAt: Date.now(),
        roomId,
    };

    const streamId = await redis.xAdd(`nexus:chat:room:${roomId}`, "*", {
        event: "chat:file",
        payload: JSON.stringify(messagePayload),
    });

    await redis.hSet(
        `nexus:chat:sync:${roomId}`,
        socket.data.session.id,
        streamId,
    );
    socket.to(roomId).emit(ChatEvents.Chat.File, {
        ...messagePayload,
        from: "message-broadcast",
        streamId,
    });
}