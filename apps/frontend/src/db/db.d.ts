import type { User } from "better-auth";

export interface Room {
    id: string;
    name: string;
}

export interface RoomMember {

    roomId: string;
    userId: string;
}

export type CachedUser = Pick<User, "id" | "name" | "email" | "image">;

export type RoomWithMembers = Room & {
    members: CachedUser[];
};