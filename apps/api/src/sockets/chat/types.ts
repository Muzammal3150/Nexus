import type { Namespace } from "socket.io";

export interface ChatContext {
    io: Namespace;
    // callManager: CallManager;
}