
import { CachedFileData } from "@/db/db.d";
import { UserPreview } from "@/lib/auth/users";


export type ChatMessage = ChatFileMessage | ChatTextMessage;

export interface BaseChatMessage {
    id: string;
    sender: UserPreview;
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