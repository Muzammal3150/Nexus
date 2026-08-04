import { SessionType } from "@/components/auth/session-provider";
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

export function getRoom(roomId: string): Promise<CallRoom> {
    return new Promise((resolve, reject) => {
        callSocket.emit(
            "call:get-room",
            roomId,
            (response: GetRoomResponse) => {
                if (!response.success || response.room == undefined) {
                    return reject(
                        new Error("Failed to get call room.")
                    );
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
        state: {
            camera: false,
            mic: false,
        },
    }))


}

