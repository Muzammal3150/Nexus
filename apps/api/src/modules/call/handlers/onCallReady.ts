import type { Socket } from "socket.io";
import { z } from "zod";

import { CallEvents } from "../events.js";

const roomReadySchema = z.object({
    roomId: z.string().min(1),
});

function validate(socket: Socket, data: unknown) {
    const result = roomReadySchema.safeParse(data);

    if (!result.success) {
        socket.emit(CallEvents.Error, { message: "" });
        return;
    }

    return result
}

export async function onCallReady(socket: Socket, data: unknown) {
    const payload = validate(socket, data)
    if (!payload) return

    const { roomId } = payload.data;

    socket.to(roomId).emit(CallEvents.ReadyBroadcast, {
        user: socket.data.user,
        roomId,
    });
}