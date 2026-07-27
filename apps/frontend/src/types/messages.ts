import { User } from "better-auth";

export interface ChatMessage {
    id: string;
    sender: User;

    sendedAt: string;
    body: string;
    isMine: boolean;

}