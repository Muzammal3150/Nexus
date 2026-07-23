import { Router } from "express";
import { auth } from "../config/auth.js";
import prisma from "../config/prisma.js";

export const router: Router = Router();




router.get("/", async (req, res) => {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const rooms = await prisma.room.findMany({
        where: {
            members: {
                some: {
                    id: session.user.id,
                },
            },
        },
        include: { members: true },
    });

    return res.json(rooms);
});

router.post("/", async (req, res) => {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const {
        name,
        memberIds,
        description
    }: {
        name: string;
        description?: string;
        memberIds: string[];
    } = req.body;

    // Always include the creator
    const members = [...new Set([session.user.id, ...memberIds])];

    const room = await prisma.room.create({
        data: {
            name,
            description,
            members: {
                connect: members.map((id) => ({ id })),
            },
        },
        include: {
            members: true,
        },
    });

    return res.status(201).json(room);
});