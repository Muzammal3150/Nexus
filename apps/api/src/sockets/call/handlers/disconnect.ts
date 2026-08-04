import type { Socket } from "socket.io";
import type { CallContext } from "../types.js";
import { onCallLeave } from "./leave-room.js";

export async function onDisconnect(ctx: CallContext, socket: Socket) {
    if (!socket.data?.user?.id) return;

    let rooms;
    try {
        rooms = ctx.callManager.getUserRooms(socket.data.user.id);
    } catch (err) {
        console.error(`Error fetching rooms for disconnecting user ${socket.data.user.id}:`, err);
        return;
    }

    // Run leaves concurrently via allSettled so one failing room never blocks
    // cleanup of the others, and every rejection still gets logged.
    const results = await Promise.allSettled(
        rooms.map((room) => onCallLeave(ctx, socket, { roomId: room.id }))
    );

    for (const result of results) {
        if (result.status === "rejected") {
            console.error("Error leaving a room during disconnect cleanup:", result.reason);
        }
    }

    console.log(`${socket.data.user.name} disconnected`);
}