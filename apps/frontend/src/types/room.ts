import { User } from "better-auth";

export interface Room {
    avatar?: string;
    createdAt: string;
    updateAt: string;
    description?: string;
    id: string;
    isGroup: boolean;
    name?: string;
    members: RoomMember[]
}

export interface RoomMember {
    id: string;
    roomId: string;
    room: Room;
    userId: string;
    user: User;
    role: "admin" | "client"
    joinedAt: string
}