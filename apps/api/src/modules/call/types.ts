
import type { Namespace } from "socket.io";
import type { User } from "../../config/auth.js";
import type { CallManager } from "./callManager.js";

// types.ts
export interface CallMember {
    id: string;
    user: User;
    isJoined: boolean;
}

export interface CallRoom {
    id: string;
    sender: User;
    members: CallMember[];
    createdAt: number;
    started: boolean;
}

export interface CallContext {
    io: Namespace;
    callManager: CallManager;
}

export interface RTCSessionDescriptionInit {

}