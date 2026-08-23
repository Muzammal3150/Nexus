import type { Socket } from "socket.io";
import z from "zod";
import { ChatEvents } from "../events.js";

const typingPayloadSchema = z.object({
    roomId: z.string().trim().min(1),
    isTyping: z.boolean(),
});


export function onTyping(socket: Socket, data: unknown) {
    const payload = validate(socket, data);
    if (!payload) return;

    const { roomId, isTyping } = payload;

    socket.to(`room:${roomId}`).emit("chat:typing-broadcast", {
        roomId,
        userId: socket.data.user.id,
        isTyping,
    });
}
function validate(socket: Socket, data: unknown) {
    if (!socket.data.user?.id) return null;

    const result = typingPayloadSchema.safeParse(data);

    if (!result.success) {
        socket.emit(ChatEvents.Error, { message: result.error.issues[0]?.message ?? "Invalid payload" });
        return null;
    }

    if (!socket.rooms.has(`room:${result.data.roomId}`)) {
        socket.emit(ChatEvents.Error, { message: "You are not a member of this room" });
        return null;
    }

    return result.data;
}

