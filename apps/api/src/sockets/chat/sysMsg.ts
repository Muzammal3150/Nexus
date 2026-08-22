
import { socketServer } from "../../config/socket.js";
import { ChatEvents } from "./events.js";

interface SysMessagePayload {
    roomId: string;
    code: string;
    message: string;
}

export function sysMessage({ roomId, code, message }: SysMessagePayload) {
    const io = socketServer.getIO("/chat")?.io
    console.log(roomId, code, message)
    io?.to(`room:${roomId}`).emit(ChatEvents.Sys, {
        id: crypto.randomUUID(),
        code,
        message,
        roomId,
        sentAt: Date.now()
    });
}