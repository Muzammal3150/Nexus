import type { Request, Response } from 'express';
import { z } from 'zod';
import { auth } from '../../config/auth.js';
import prisma from '../../config/prisma.js';

const MAX_GROUP_MEMBERS = 200;

const createRoomSchema = z.object({
    name: z
        .string()
        .trim()
        .optional(),
    memberIds: z
        .array(z
            .string()
            .trim()
            .min(1))
        .min(1),
    isGroup: z.boolean(),
    
}).superRefine((data, ctx) => {
    if (data.isGroup && !data.name) {
        ctx.addIssue({
            code: 'custom',
            path: ['name'],
            message: 'Group chats require a name',
        });
    }
});

export async function createRoom(req: Request, res: Response) {


    const userId = req.user.id;
    const result = createRoomSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: 'Invalid room data',
            errors: result.error.flatten().fieldErrors,
        });
    }

    const { name, memberIds: requestedMemberIds, isGroup } = result.data;

    const memberIds = [...new Set([...requestedMemberIds, userId])];

    if (memberIds.length < 2) {
        return res.status(400).json({
            message: 'A room needs at least one other member',
        });
    }

    if (!isGroup && memberIds.length !== 2) {
        return res.status(400).json({
            message: 'Direct messages must have exactly two members',
        });
    }

    if (isGroup && memberIds.length > MAX_GROUP_MEMBERS) {
        return res.status(400).json({
            message: `A group cannot have more than ${MAX_GROUP_MEMBERS} members`,
        });
    }

    const users = await prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: { id: true },
    });

    if (users.length !== memberIds.length) {
        const existingIds = new Set(users.map((user) => user.id));
        const missingIds = memberIds.filter((id) => !existingIds.has(id));

        return res.status(400).json({
            message: 'Some members could not be found',
            missingIds,
        });
    }

    if (!isGroup) {
        const otherUserId = memberIds.find((id) => id !== userId)!;

        const existingRoom = await prisma.room.findFirst({
            where: {
                isGroup: false,
                members: {
                    every: {
                        userId: { in: [userId, otherUserId] },
                    },
                },
            },
            include: {
                members: {
                    include: { user: true },
                },
            },
        });

        if (existingRoom?.members.length === 2) {
            return res.json({
                alreadyExists: true,
                room: existingRoom,
            });
        }
    }

    const room = await prisma.room.create({
        data: {
            name: isGroup ? name! : name ?? '',
            isGroup,
            members: {
                create: memberIds.map((memberId) => ({
                    user: { connect: { id: memberId } },
                    role: isGroup && memberId === userId ? 'admin' : 'member',
                })),
            },
        },
        include: {
            members: {
                include: { user: true },
            },
        },
    });

    return res.status(201).json({ room });
}