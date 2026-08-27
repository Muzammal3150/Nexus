import type { User } from "better-auth";
import type { Room, RoomMember } from "../../generated/prisma/client.js";

export interface RoomWithMembers extends Room {
    members: RoomMemberWithUser[];
}

export interface RoomMemberWithUser extends RoomMember {
    user: User;
}