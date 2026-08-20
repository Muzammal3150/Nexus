import type { Request, Response } from "express";
import { auth } from "../../config/auth.js";
import prisma from "../../config/prisma.js";

const MAX_GROUP_MEMBERS = 200;

interface CreateRoomBody {
    name?: string;
    memberIds: string[];
    isGroup: boolean;
}

export async function createRoom(req: Request, res: Response) {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return res.status(401).json({
            message: 'Unauthorized',
        });
    }

    const userId = session.user.id;
    const body = req.body as Partial<CreateRoomBody>;

    if (!Array.isArray(body.memberIds)) {
        return res.status(400).json({ error: "memberIds must be an array" });
    }

    if (typeof body.isGroup !== "boolean") {
        return res.status(400).json({ error: "isGroup must be a boolean" });
    }

    if (body.isGroup && (!body.name?.trim())) {
        return res.status(400).json({ error: "Group chats require a name" });
    }

    const memberIds = [...new Set([...body.memberIds, userId].filter((id) => typeof id === "string" && id.trim()))];

    if (memberIds.length < 2) {
        return res.status(400).json({ error: "A room needs at least one other member" });
    }

    if (!body.isGroup && memberIds.length !== 2) {
        return res.status(400).json({ error: "Direct messages must have exactly two members" });
    }

    if (body.isGroup && memberIds.length > MAX_GROUP_MEMBERS) {
        return res.status(400).json({ error: `A group cannot have more than ${MAX_GROUP_MEMBERS} members` });
    }

    const users = await prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: { id: true },
    });

    if (users.length !== memberIds.length) {
        const existingIds = new Set(users.map((user) => user.id));
        const missingIds = memberIds.filter((id) => !existingIds.has(id));

        return res.status(400).json({
            error: `Some members could not be found: ${missingIds.join(", ")}`,
        });
    }

    if (!body.isGroup) {
        const existingRoom = await prisma.room.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { members: { some: { userId } } },
                    { members: { some: { userId: memberIds.find((id) => id !== userId)! } } },
                ],
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
            name: body.isGroup ? body.name!.trim() : body.name?.trim() ?? "",
            isGroup: body.isGroup,
            members: {
                create: memberIds.map((memberId) => ({
                    user: { connect: { id: memberId } },
                    role: body.isGroup && memberId === userId ? "admin" : "client",
                })),
            },
        },
        include: {
            members: {
                include: { user: true },
            },
        },
    });

    return res.status(201).json({
        room,
    });
}