import { safeAck } from "../safeAck.js";
import type { CallContext } from "../types.js";


interface GetRoomResponse {
    success: boolean;
    error?: string;
    room?: {
        id: string;
        sender: unknown;
        memberIds: string[];
        createdAt: string;
        started: boolean;
        acceptedUserIds: string[];
        joinedUserIds: string[];
        rejectedUserIds: string[];
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
        room: {
            id: room.id,
            sender: room.sender,
            memberIds: room.memberIds,
            createdAt: room.createdAt,
            started: room.started,
            acceptedUserIds: [...room.acceptedUserIds],
            joinedUserIds: [...room.joinedUserIds],
            rejectedUserIds: [...room.rejectedUserIds],
        },
    });
}

