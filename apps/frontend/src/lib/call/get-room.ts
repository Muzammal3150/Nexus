import { SessionType } from "@/components/providers/session-provider";
import { CallRoom } from "@/types/calls";
import { User } from "better-auth";
import { api } from "../axios";
import { callSocket } from "../socket";



interface GetRoomResponse {
    success: boolean;
    error?: string;
    room?: {
        id: string;
        sender: User;
        memberIds: string[];
        createdAt: number;
        started: boolean;
        acceptedUserIds: string[];
        joinedUserIds: string[];
        rejectedUserIds: string[];
    };
}

const GET_ROOM_TIMEOUT_MS = 10_000;

export function getRoom(roomId: string): Promise<CallRoom> {
    if (!roomId || typeof roomId !== "string") {
        return Promise.reject(new Error("getRoom requires a valid roomId"));
    }

    return new Promise((resolve, reject) => {
        if (!callSocket.connected) {
            reject(new Error("Not connected to the call server"));
            return;
        }

        let settled = false;

        const timeout = setTimeout(() => {
            if (settled) return;
            settled = true;
            callSocket.off("disconnect", onDisconnect);
            reject(new Error("Timed out waiting for room info"));
        }, GET_ROOM_TIMEOUT_MS);

        const onDisconnect = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            reject(new Error("Disconnected from the call server"));
        };

        // If the socket drops before the ack ever arrives, don't hang forever.
        callSocket.once("disconnect", onDisconnect);

        callSocket.emit(
            "call:get-room",
            roomId,
            (response: GetRoomResponse) => {
                console.log("GET ROM", response)
                if (settled) return; // e.g. timeout/disconnect already fired
                settled = true;
                clearTimeout(timeout);
                callSocket.off("disconnect", onDisconnect);

                if (!response?.success || response.room == undefined) {
                    reject(new Error(response?.error ?? "Failed to get call room"));
                    return;
                }

                resolve(response.room);
            }
        );
    });
}


export async function loadMembers(room: CallRoom, session: SessionType) {

    const params = new URLSearchParams();

    room.memberIds.forEach(id => params.append("ids", id));

    const { data: users } = await api.get<User[]>(`/users/many/id?${params.toString()}`);

    return users.map(user => ({
        user,
        isSelf: user.id === session?.user.id,
        joined: room.joinedUserIds.includes(user.id),

    }))


}

