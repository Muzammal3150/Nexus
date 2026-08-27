
import type { Namespace } from "socket.io";
import type { User } from "../../config/auth.js";
import type { CallManager } from "./callManager.js";

export interface CallRoom {
    id: string;
    sender: User;
    memberIds: string[];

    acceptedUserIds: Set<string>;
    rejectedUserIds: Set<string>;
    joinedUserIds: Set<string>;

    createdAt: number;
    started: boolean;
    // timeout: NodeJS.Timeout;
}

export interface CallContext {
    io: Namespace;
    callManager: CallManager;
}

export interface RTCSessionDescriptionInit {
    
}