import { Router } from "express";
import { auth } from "../config/auth.js";
import prisma from "../config/prisma.js";

export const router: Router = Router();




router.get("/:roomId", async (req, res) => {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const { roomId } = req.params
    const rooms = await prisma.room.findUnique({
        where: {
            id: roomId
        },
        include: {
            members: {
                include: {
                    user: true,
                }
            }
        },
    });

    return res.json(rooms);
});
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
                    userId: session.user.id,
                },
            },
        },
        include: {
            members: {
                include: {
                    user: true,
                }
            }
        },
    });

    return res.json(rooms);
});

