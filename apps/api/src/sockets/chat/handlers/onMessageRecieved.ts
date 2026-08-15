import type { Socket } from "socket.io";
import { redis } from "../../../config/redis.js";

interface MessageReceivePayload {
    streamId: string;
    roomId: string;
}

function validate(
    socket: Socket,
    data: unknown,
): data is MessageReceivePayload {
    if (!data || typeof data !== "object") {
        return false;
    }

    const payload = data as Record<string, unknown>;

    if (typeof payload.roomId !== "string") {
        return false;
    }

    if (typeof payload.streamId !== "string") {
        return false;
    }

    if (!socket.data.user?.id) {
        return false;
    }

    return true;
}

export async function onMessageReceived(socket: Socket, data: unknown) {
    if (!validate(socket, data)) {
        return;
    }

    const { roomId, streamId } = data;

    // Make sure the socket is actually in this room.
    if (!socket.rooms.has(roomId)) {
        return;
    }

    // Make sure this stream ID actually exists in this room.
    const message = await redis.xRange(`nexus:chat:room:${roomId}`, streamId, streamId);

    if (message.length === 0) {
        return;
    }

    await redis.hSet(
        `nexus:chat:sync:${roomId}`,
        socket.data.session.id,
        streamId,
    );
}