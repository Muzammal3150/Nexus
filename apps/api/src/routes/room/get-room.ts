import { Router } from 'express';
import { auth } from '../../config/auth.js';
import prisma from '../../config/prisma.js';
import { redis } from '../../config/redis.js';

export const router: Router = Router();

const presenceKey = 'nexus:presence';

interface RoomParams {
    roomId: string;
}

interface UserPresence {
    isOnline: boolean;
    lastSeen: number | null;
}

function parsePresence(value: string | null): UserPresence {
    if (!value) {
        return {
            isOnline: false,
            lastSeen: null,
        };
    }

    try {
        return {
            isOnline: false,
            lastSeen: null,
            ...JSON.parse(value),
        };
    } catch {
        return {
            isOnline: false,
            lastSeen: null,
        };
    }
}

async function addPresenceToRooms(rooms: any[]) {
    const userIds = [
        ...new Set(
            rooms.flatMap((room) =>
                room.members.map((member: any) => member.user.id),
            ),
        ),
    ];

    if (userIds.length === 0) {
        return rooms;
    }

    const presenceValues = await redis.hmGet(presenceKey, userIds);
    const presenceMap = new Map<string, UserPresence>();

    userIds.forEach((userId, index) => {
        presenceMap.set(userId, parsePresence(presenceValues[index] ?? null));
    });

    return rooms.map((room) => ({
        ...room,
        members: room.members.map((member: any) => ({
            ...member,
            user: {
                ...member.user,
                ...presenceMap.get(member.user.id),
            },
        })),
    }));
}

router.get<RoomParams>('/:roomId', async (req, res) => {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return res.status(401).json({
            message: 'Unauthorized',
        });
    }

    const { roomId } = req.params;

    const room = await prisma.room.findFirst({
        where: {
            id: roomId,
            members: {
                some: {
                    userId: session.user.id,
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

    if (!room) {
        return res.status(404).json({
            message: 'Room not found',
        });
    }

    const [roomWithPresence] = await addPresenceToRooms([room]);

    return res.json(roomWithPresence);
},
);

router.get('/', async (req, res) => {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const rooms = await getAllRooms(session.user.id);

    return res.json(rooms);
});

export async function getAllRooms(userId: string) {
    const rooms = await prisma.room.findMany({
        where: {
            members: {
                some: {
                    userId,
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

    return addPresenceToRooms(rooms);
}