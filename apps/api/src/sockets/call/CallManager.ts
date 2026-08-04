import type { User } from "better-auth";
import type { CallRoom } from "./types.js";

const CALL_TIMEOUT = 1000 * 30; // 5 minutes

export class CallManager {
    private rooms = new Map<string, CallRoom>();
    private memberTimeouts = new Map<string, NodeJS.Timeout>();

    onMemberTimeout?: (room: CallRoom, userId: string) => Promise<void> | undefined;
    onRoomDelete?: (room: CallRoom) => Promise<void> | undefined;

    constructor({
        onMemberTimeout,
        onRoomDelete,
    }: {
        onMemberTimeout?: (room: CallRoom, userId: string) => Promise<void>;
        onRoomDelete?: (room: CallRoom) => Promise<void>

    }) {
        this.onMemberTimeout = onMemberTimeout;
        this.onRoomDelete = onRoomDelete;
    }

    private getTimeoutKey(roomId: string, userId: string) {
        return `${roomId}:${userId}`;
    }

    createRoom(memberIds: string[], sender: User): CallRoom {
        const uniqueMemberIds = [...new Set([...memberIds, sender.id])];

        const room: CallRoom = {
            id: crypto.randomUUID(),
            sender,
            memberIds: uniqueMemberIds,
            acceptedUserIds: new Set([sender.id]),
            rejectedUserIds: new Set(),
            joinedUserIds: new Set([sender.id]),
            createdAt: Date.now(),
            started: false,
        };

        this.rooms.set(room.id, room);

        // Start timeout for invited members only
        for (const memberId of uniqueMemberIds) {
            if (memberId === sender.id) continue;

            const key = this.getTimeoutKey(room.id, memberId);

            this.memberTimeouts.set(
                key,
                setTimeout(() => {
                    void this.expireMember(room.id, memberId);
                }, CALL_TIMEOUT),
            );
        }

        return room;
    }

    private async expireMember(roomId: string, userId: string) {
        const room = this.rooms.get(roomId);

        if (!room) return;

        // Already responded
        if (
            room.acceptedUserIds.has(userId) ||
            room.rejectedUserIds.has(userId)
        ) {
            return;
        }

        room.rejectedUserIds.add(userId);

        const key = this.getTimeoutKey(roomId, userId);
        this.memberTimeouts.delete(key);

        await this.onMemberTimeout?.(room, userId);

        this.cleanupRoom(room);
    }

    private cleanupRoom(room: CallRoom) {
        const pendingMembers = room.memberIds.filter(
            memberId =>
                !room.acceptedUserIds.has(memberId) &&
                !room.rejectedUserIds.has(memberId)
        );

        if (room.joinedUserIds.size === 0 && pendingMembers.length === 0) {
            this.removeRoom(room.id);
        }
    }

    getRoom(roomId: string): CallRoom | undefined {
        return this.rooms.get(roomId);
    }

    accept(roomId: string, user: User) {
        const room = this.getRoom(roomId);

        if (!room || !room.memberIds.includes(user.id)) return;

        room.acceptedUserIds.add(user.id);
        room.joinedUserIds.add(user.id);

        const key = this.getTimeoutKey(roomId, user.id);
        const timeout = this.memberTimeouts.get(key);

        if (timeout) {
            clearTimeout(timeout);
            this.memberTimeouts.delete(key);
        }

        return room;
    }

    reject(roomId: string, user: User) {
        const room = this.getRoom(roomId);

        if (!room || !room.memberIds.includes(user.id)) return;

        room.rejectedUserIds.add(user.id);

        const key = this.getTimeoutKey(roomId, user.id);
        const timeout = this.memberTimeouts.get(key);

        if (timeout) {
            clearTimeout(timeout);
            this.memberTimeouts.delete(key);
        }

        this.cleanupRoom(room);

        return room;
    }

    leave(roomId: string, user: User) {
        const room = this.getRoom(roomId);

        if (!room) return null;

        room.joinedUserIds.delete(user.id);

        this.cleanupRoom(room);

        return room;
    }

    removeRoom(roomId: string) {
        const room = this.rooms.get(roomId);

        if (!room) return;

        for (const memberId of room.memberIds) {
            const key = this.getTimeoutKey(roomId, memberId);
            const timeout = this.memberTimeouts.get(key);

            if (timeout) {
                clearTimeout(timeout);
                this.memberTimeouts.delete(key);
            }
        }

        this.rooms.delete(roomId);
    }

    getUserRooms(userId: string): CallRoom[] {
        return [...this.rooms.values()].filter(room =>
            room.joinedUserIds.has(userId)
        );
    }
}