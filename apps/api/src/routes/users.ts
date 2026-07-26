import { Router } from "express";
import prisma from "../config/prisma.js";

export const router: Router = Router();
router.get("/many", async (req, res) => {
    const usernames = req.query.usernames;

    const values = Array.isArray(usernames) ? usernames as string[] : typeof usernames === "string" ? usernames.split(",") : [];

    if (values.length === 0) {
        return res.status(400).json({
            message: "usernames are required.",
        });
    }

    const users = await prisma.user.findMany({
        where: {
            username: { in: values }
        },
        select: {
            id: true,
            name: true,
            username: true,
            image: true,

        }
    });

    return res.json(users);
});

router.get("/:username", async (req, res) => {
    const { username } = req.params;
    if (!username) {
        return res.status(400).json({
            message: "Username is required."
        });
    }

    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            name: true,
            username: true,
            image: true,

        }
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found."
        });
    }

    return res.json(user);
});


