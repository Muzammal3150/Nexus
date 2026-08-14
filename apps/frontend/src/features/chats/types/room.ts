
import { UserPreview } from '@/features/auth/lib/users';
import { ChatMessage } from "./messages";

export interface Room {
    avatar?: string;
    createdAt: string;
    updateAt: string;
    description?: string;
    id: string;
    isGroup: boolean;
    name: string;
    members: RoomMember[]
    unread: number;
    lastMessage: ChatMessage | null;
}

export interface RoomMember {
    id: string;
    roomId: string;
    room: Room;
    userId: string;
    user: UserPreview;
    role: "admin" | "client"
    joinedAt: string
}