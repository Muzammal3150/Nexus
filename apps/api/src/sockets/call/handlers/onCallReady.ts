
import type { Socket } from "socket.io";
import { CallEvents } from "../events.js";
import type { CallContext } from "../types.js";

interface RoomReadyPayload {
    roomId: string;
}


export async function onCallReady(socket: Socket, data: unknown) {
    const { roomId } = data as RoomReadyPayload;
    socket.to(roomId).emit(CallEvents.ReadyBroadcast, { user: socket.data.user, roomId });
}
