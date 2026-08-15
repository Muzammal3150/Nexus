
import { UserPreview } from '@/features/auth/lib/users';
import { ChatMessage } from "./messages";

export interface Room {
    image?: string | null;
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
    roomId: string;
    room: Room;
    userId: string;
    user: UserPreview;
    role: "admin" | "client"
    joinedAt: string
}

