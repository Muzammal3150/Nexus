import type { Socket } from "socket.io";
import { z } from "zod";
import { ChatEvents } from "../events.js";
import { redis } from "../../../config/redis.js";

const filePayloadSchema = z.object({
    id: z.string().trim().min(1, "A valid message id is required"),
    roomId: z.string().trim().min(1, "A valid roomId is required"),
    attachment: z.object({
        fileId: z.string().trim().min(1),
        filename: z.string().trim().min(1),
        originalFilename: z.string().trim().min(1),
        mimeType: z.string().trim().min(1),
        size: z.number().nonnegative(),
    }),
});

type FilePayload = z.infer<typeof filePayloadSchema>;

function validate(socket: Socket, data: unknown): FilePayload | null {
    const result = filePayloadSchema.safeParse(data);

    if (!result.success) {
        socket.emit(ChatEvents.Error, {
            message: result.error.issues[0]?.message ?? "Invalid file payload",
        });
        return null;
    }

    const { roomId } = result.data;

    if (!socket.rooms.has(`room:${roomId}`)) {
        socket.emit(ChatEvents.Error, {
            message: "You are not a member of this room",
        });
        return null;
    }

    return result.data;
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

    const streamId = await redis.xAdd(
        `nexus:chat:room:${roomId}`,
        "*",
        {
            event: "chat:file",
            payload: JSON.stringify(messagePayload),
        },
    );

    await redis.hSet(
        `nexus:chat:sync:${roomId}`,
        socket.data.session.id,
        streamId,
    );

    socket.to(`room:${roomId}`).emit(ChatEvents.Chat.File, {
        ...messagePayload,
        from: "message-broadcast",
        streamId,
    });
}