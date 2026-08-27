import type { Request, Response } from 'express';
import prisma from '../../../config/prisma.js';
import { redis } from '../../../config/redis.js';
import type { RoomWithMembers } from '../types.js';

const presenceKey = 'nexus:presence';

interface RoomParams {
    roomId: string;
}

interface UserPresence {
    isOnline: boolean;
    lastSeen: number | null;
}



function parsePresence(value: string | null): UserPresence {
    if (!value) return { isOnline: false, lastSeen: null };

    try {
        return {
            isOnline: false,
            lastSeen: null,
            ...JSON.parse(value),
        };
    } catch {
        return { isOnline: false, lastSeen: null };
    }
}

async function addPresenceToRooms(rooms: RoomWithMembers[]) {
    const userIds = [...new Set(rooms.flatMap((room) => room.members.map((member) => member.userId)))];

    if (userIds.length === 0) return rooms;

    const presenceValues = await redis.hmGet(presenceKey, userIds);
    const presenceMap = new Map<string, UserPresence>();

    userIds.forEach((userId, index) => {
        presenceMap.set(userId, parsePresence(presenceValues[index] ?? null));
    });

    return rooms.map((room) => ({
        ...room,
        members: room.members.map((member) => ({
            ...member,
            user: {
                ...member.user,
                ...presenceMap.get(member.userId),
            },
        })),
    }));
}

export async function getRoom(req: Request<RoomParams>, res: Response) {

    const room = await prisma.room.findFirst({
        where: {
            id: req.params.roomId,
            members: {
                some: {
                    userId: req.user.id,
                },
            },
        },
        include: {
            members: {
                include: {
                    user: true,
                },
            },
        },
    });

    if (!room) return res.status(404).json({ message: 'Room not found' });

    const [roomWithPresence] = await addPresenceToRooms([room]);

    return res.json(roomWithPresence);
}

export async function getRooms(req: Request, res: Response) {

    const rooms = await getAllRooms(req.user.id);

    return res.json(rooms);
}

export async function getAllRooms(userId: string) {
    const rooms = await prisma.room.findMany({
        where: {
            members: {
                some: { userId },
            },
        },
        include: {
            members: {
                include: {
                    user: true,
                },
            },
        },
    });

    return addPresenceToRooms(rooms);
}