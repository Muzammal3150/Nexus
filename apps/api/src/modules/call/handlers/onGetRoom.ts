import { safeAck } from "../safeAck.js";
import type { CallContext, CallRoom } from "../types.js";


interface GetRoomResponse {
    success: boolean;
    error?: string;
    room?: {
        id: string;
        sender: unknown;
        createdAt: number;
        started: boolean;
        members: {
            id: string;
            isJoined: boolean;
        }[];
    };
}


export async function onGetRoom(ctx: CallContext, roomId: unknown, cb: unknown) {
    console.log("GET ROOM", roomId)
    if (typeof roomId !== "string" || !roomId.trim()) {
        return safeAck<GetRoomResponse>(cb, {
            success: false,
            error: "A valid roomId is required",
        });
    }

    let room;
    try {
        room = ctx.callManager.getRoom(roomId);
    } catch (err) {
        console.error(`Error fetching room ${roomId}:`, err);
        return safeAck<GetRoomResponse>(cb, { success: false, error: "Failed to fetch room" });
    }

    if (!room) {
        return safeAck<GetRoomResponse>(cb, { success: false, error: "Room not found" });
    }

    safeAck<GetRoomResponse>(cb, {
        success: true,
        room: serializeRoom(room),
    });
}


export function serializeRoom(room: CallRoom) {
    return {
        id: room.id,
        sender: room.sender,
        createdAt: room.createdAt,
        started: room.started,

        members: room.members.map((member) => ({
            id: member.id,
            user: {
                id: member.user.id,
                name: member.user.name,
                email: member.user.email,
                image: member.user.image,
            },

            isJoined: member.isJoined,
        })),
    }
}

