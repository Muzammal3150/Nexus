import type { Request, Response } from "express";
import prisma from "../../../config/prisma.js";
import { getUserPresence } from "../../presence/getPresence.js";

export async function getUser(req: Request<{ username: string }>, res: Response) {
    const user = await prisma.user.findUnique({
        where: { username: req.params.username },
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true,
        },
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found.",
        });
    }

    const presence = await getUserPresence(user.id);

    return res.json({ ...user, ...presence });
}