
import { CachedFileData } from "@/db/db.d";
import { UserPreview } from "@/features/auth/lib/users";
import { Contact } from "@/features/contacts/stores/contact-store";


export type ChatMessage = ChatFileMessage | ChatTextMessage;

export interface BaseChatMessage {
    id: string;
    sender: UserPreview | Contact;
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