import { User } from "better-auth";

export interface ChatMessage {
    id: string;
    sender: User;

    roomId: string;
    sendedAt: string;
    body: string;
    isMine: boolean;
    read: boolean;

}