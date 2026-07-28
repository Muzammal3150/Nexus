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
    
    const rooms = await getAllRooms(session.user.id)

    return res.json(rooms);
});

export function getAllRooms(userId: string) {
    return prisma.room.findMany({
        where: {
            members: { some: { userId, } },
        },
        include: {
            members: {
                include: {
                    user: true,
                }
            }
        },
    });

}