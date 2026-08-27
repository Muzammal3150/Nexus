import type { Request, Response } from "express";
import prisma from "../../../config/prisma.js";

export async function getCommonRoom(req: Request<{ userId: string }>, res: Response) {
    console.log("hi")
    try {

        const { userId } = req.params;
        const myUserId = req.user.id;

        const rooms = await prisma.room.findMany({
            where: {
                AND: [
                    { members: { some: { userId: myUserId } } },
                    { members: { some: { userId } } },
                ],
            },
            include: {
                members: true,
            }
        });

        return res.json(rooms);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch common rooms" });
    }
}