import type { Socket } from "socket.io";
import { z } from "zod";
import { ChatEvents } from "../events.js";
import { redis } from "../../../config/redis.js";
// import { SysMessageCodes } from "../sysMessage.js";





const sysMessageSchema = z.object({
    roomId: z.string().trim().min(1),
    code: z.string(),
});

type SysMessagePayload = z.infer<typeof sysMessageSchema>;

function validate(socket: Socket, data: unknown): SysMessagePayload | null {
    const result = sysMessageSchema.safeParse(data);

    if (!result.success) {
        socket.emit(ChatEvents.Error, { message: "Invalid system message" });
        return null;
    }

    const { roomId } = result.data;

    if (!socket.rooms.has(roomId)) {
        socket.emit(ChatEvents.Error, {
            message: "You are not a member of this room",
        });
        return null;
    }

    return result.data;
}

export async function onSysMessage(socket: Socket, data: unknown) {
    const payload = validate(socket, data);
    if (!payload) return;

    const { roomId, code } = payload;

    const messagePayload = {
        id: crypto.randomUUID(),
        sender: socket.data.user,
        code,
        sentAt: Date.now(),
        roomId,
    };

    const streamId = await redis.xAdd(`nexus:chat:room:${roomId}`, "*", {
        event: "chat:system",
        payload: JSON.stringify(messagePayload),
    });

    socket.to(roomId).emit(ChatEvents.Sys, {
        ...messagePayload,
        streamId,
    });

    socket.emit(ChatEvents.Sys, {
        ...messagePayload,
        isMine: true,
        streamId,
    });

    await redis.hSet(
        `nexus:chat:sync:${roomId}`,
        socket.data.session.id,
        streamId,
    );
}