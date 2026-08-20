import type { Socket } from "socket.io";
import type { CallContext } from "../types.js";
import { onCallLeave } from "./onCallLeave.js";

export async function onDisconnect(ctx: CallContext, socket: Socket) {
    if (!socket.data?.user?.id) return;

    console.log("CALL_SOCKET: User Disconnected", socket.data.user.name)
    
    
    let rooms;
    try {
        rooms = ctx.callManager.getUserRooms(socket.data.user.id);
    } catch (err) {
        console.error(`Error fetching rooms for disconnecting user ${socket.data.user.id}:`, err);
        return;
    }

    const results = await Promise.allSettled(
        rooms.map((room) => onCallLeave(ctx, socket, { roomId: room.id }))
    );

    for (const result of results) {
        if (result.status === "rejected") {
            console.error("Error leaving a room during disconnect cleanup:", result.reason);
        }
    }

}