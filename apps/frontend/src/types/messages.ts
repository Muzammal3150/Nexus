
import { CachedFileData } from "@/db/db.d";
import { User } from '@/lib/auth/auth';


export type ChatMessage = ChatFileMessage | ChatTextMessage;

export interface BaseChatMessage {
    id: string;
    sender: User;
    roomId: string;
    sentAt: number;
    isMine: boolean;
    isRead: boolean;
}

export interface ChatFileMessage extends BaseChatMessage {
    type: "file";
    attachment: CachedFileData;
}

export interface ChatTextMessage extends BaseChatMessage {
    type: "text";
    text: string;
}