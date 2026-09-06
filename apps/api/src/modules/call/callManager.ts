import type { User } from "../../config/auth.js";
import type { CallMember, CallRoom } from "./types.js";
import prisma from "../../config/prisma.js";

const minute = 1000 * 60;
const CALL_TIMEOUT = 1 * minute;

export class CallManagerError extends Error {
    constructor(
        message: string,
        public readonly code:
            | "ROOM_NOT_FOUND"
            | "MEMBER_NOT_FOUND"
            | "ALREADY_JOINED"
            | "NOT_JOINED"
            | "INVALID_ROOM"
            | "INVALID_USER",
    ) {
        super(message);
        this.name = "CallManagerError";
    }
}

export class CallManager {
    private rooms = new Map<string, CallRoom>();
    private memberTimeouts = new Map<string, NodeJS.Timeout>();

    onMemberTimeout:
        | ((room: CallRoom, userId: string) => Promise<void>)
        | undefined;

    onRoomDelete:
        | ((room: CallRoom) => Promise<void>)
        | undefined;

    constructor({
        onMemberTimeout,
        onRoomDelete,
    }: {
        onMemberTimeout?: (room: CallRoom, userId: string) => Promise<void>;
        onRoomDelete?: (room: CallRoom) => Promise<void>;
    }) {
        this.onMemberTimeout = onMemberTimeout;
        this.onRoomDelete = onRoomDelete;
    }

    private getTimeoutKey(roomId: string, userId: string) {
        return `${roomId}:${userId}`;
    }

    private getRoomOrThrow(roomId: string) {
        if (!roomId) {
            throw new CallManagerError(
                "Room ID is required.",
                "INVALID_ROOM",
            );
        }

        const room = this.rooms.get(roomId);

        if (!room) {
            throw new CallManagerError(
                "Call room not found.",
                "ROOM_NOT_FOUND",
            );
        }

        return room;
    }

    private getMemberOrThrow(room: CallRoom, userId: string) {
        if (!userId) {
            throw new CallManagerError(
                "User ID is required.",
                "INVALID_USER",
            );
        }

        const member = room.members.find((member) => member.id === userId);

        if (!member) {
            throw new CallManagerError(
                "User is not a member of this call.",
                "MEMBER_NOT_FOUND",
            );
        }

        return member;
    }

    async createRoom(memberIds: string[], sender: User): Promise<CallRoom> {
        if (!sender?.id) {
            throw new CallManagerError(
                "A valid sender is required.",
                "INVALID_USER",
            );
        }

        const uniqueMemberIds = [...new Set([...memberIds, sender.id])];

        if (uniqueMemberIds.length === 0) {
            throw new CallManagerError(
                "A call must have at least one member.",
                "MEMBER_NOT_FOUND",
            );
        }

        try {
            const users = await prisma.user.findMany({
                where: {
                    id: {
                        in: uniqueMemberIds,
                    },
                },
            });

            const usersById = new Map(users.map((user) => [user.id, user]));

            const members: CallMember[] = [];

            for (const id of uniqueMemberIds) {
                const user = usersById.get(id);

                if (!user) {
                    continue;
                }

                members.push({
                    id,
                    user,
                    isJoined: id === sender.id,
                });
            }

            if (!members.some((member) => member.id === sender.id)) {
                throw new CallManagerError(
                    "Sender does not exist.",
                    "INVALID_USER",
                );
            }

            const room: CallRoom = {
                id: crypto.randomUUID(),
                sender,
                members,
                createdAt: Date.now(),
                started: false,
            };

            this.rooms.set(room.id, room);

            for (const member of room.members) {
                if (member.id === sender.id) continue;

                const key = this.getTimeoutKey(room.id, member.id);

                this.memberTimeouts.set(
                    key,
                    setTimeout(() => {
                        void this.expireMember(room.id, member.id);
                    }, CALL_TIMEOUT),
                );
            }

            return room;
        } catch (error) {
            if (error instanceof CallManagerError) {
                throw error;
            }

            console.error("Failed to create call room:", error);
            throw new CallManagerError(
                "Failed to create call room.",
                "INVALID_ROOM",
            );
        }
    }

    private async expireMember(roomId: string, userId: string) {
        const room = this.rooms.get(roomId);

        if (!room) return;

        const member = room.members.find((member) => member.id === userId);

        if (!member || member.isJoined) return;

        room.members = room.members.filter(
            (member) => member.id !== userId,
        );

        this.clearMemberTimeout(roomId, userId);

        try {
            await this.onMemberTimeout?.(room, userId);
        } catch (error) {
            console.error(
                `Failed to handle timeout for member ${userId}:`,
                error,
            );
        }

        this.cleanupRoom(room);
    }

    private clearMemberTimeout(roomId: string, userId: string) {
        const key = this.getTimeoutKey(roomId, userId);
        const timeout = this.memberTimeouts.get(key);

        if (!timeout) return;

        clearTimeout(timeout);
        this.memberTimeouts.delete(key);
    }

    private cleanupRoom(room: CallRoom) {
        if (room.members.length === 0) {
            void this.removeRoom(room.id);
        }
    }

    getRoom(roomId: string): CallRoom | undefined {
        return this.rooms.get(roomId);
    }

    accept(roomId: string, user: User) {
        const room = this.getRoomOrThrow(roomId);
        const member = this.getMemberOrThrow(room, user.id);

        if (member.isJoined) {
            throw new CallManagerError(
                "User has already joined this call.",
                "ALREADY_JOINED",
            );
        }

        member.isJoined = true;
        this.clearMemberTimeout(roomId, user.id);

        return room;
    }

    reject(roomId: string, user: User) {
        const room = this.getRoomOrThrow(roomId);
        const member = this.getMemberOrThrow(room, user.id);

        if (member.isJoined) {
            throw new CallManagerError(
                "A joined member cannot reject the call. They must leave instead.",
                "ALREADY_JOINED",
            );
        }

        room.members = room.members.filter(
            (member) => member.id !== user.id,
        );

        this.clearMemberTimeout(roomId, user.id);
        this.cleanupRoom(room);

        return room;
    }

    leave(roomId: string, user: User) {
        const room = this.getRoomOrThrow(roomId);
        const member = this.getMemberOrThrow(room, user.id);

        if (!member.isJoined) {
            throw new CallManagerError(
                "User has not joined this call.",
                "NOT_JOINED",
            );
        }

        room.members = room.members.filter(
            (member) => member.id !== user.id,
        );

        this.clearMemberTimeout(roomId, user.id);
        this.cleanupRoom(room);

        return room;
    }

    async removeRoom(roomId: string) {
        const room = this.rooms.get(roomId);

        if (!room) return;

        for (const member of room.members) {
            this.clearMemberTimeout(roomId, member.id);
        }

        this.rooms.delete(roomId);

        try {
            await this.onRoomDelete?.(room);
        } catch (error) {
            console.error(
                `Failed to handle deletion of call room ${roomId}:`,
                error,
            );
        }
    }

    getUserRooms(userId: string): CallRoom[] {
        return [...this.rooms.values()].filter((room) =>
            room.members.some(
                (member) =>
                    member.id === userId && member.isJoined,
            ),
        );
    }

    isMember(roomId: string, userId: string) {
        return (
            this.rooms.get(roomId)?.members.some(
                (member) => member.id === userId,
            ) ?? false
        );
    }

    hasJoined(roomId: string, userId: string) {
        const room = this.rooms.get(roomId);

        return room
            ? this.getMemberOrThrow(room, userId).isJoined
            : false;
    }
}