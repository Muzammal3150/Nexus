import { redis } from "../../config/redis.js";
import { socketServer } from "../../config/socket.js";
import { ChatEvents } from "./events.js";

interface SysMessagePayload {
    roomId: string;
    code: string;
    message: string;
}

export async function sysMessage({
    roomId,
    code,
    message,
}: SysMessagePayload) {
    const messagePayload = {
        id: crypto.randomUUID(),
        code,
        message,
        roomId,
        sentAt: Date.now(),
    };

    const streamId = await redis.xAdd(`nexus:chat:room:${roomId}`,
        "*",
        {
            event: "chat:system",
            payload: JSON.stringify(messagePayload),
        },
    );

    const io = socketServer.getIO("/chat")?.io;

    io?.to(`room:${roomId}`).emit(ChatEvents.Sys, {
        ...messagePayload,
        streamId,
    });

    return streamId;
}