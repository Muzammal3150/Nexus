import { Router } from "express";
import prisma from "../config/prisma.js";

export const router: Router = Router();

router.get("/", async (req, res) => {
    const { identifier } = req.query as {
        identifier?: string;
    };

    if (!identifier) {
        return res.status(400).json({
            message: "identifier is required."
        });
    }

    const user = await prisma.user.findFirst({
        where: {
            OR: [
                // { id: identifier },
                { email: identifier },
                // { username: identifier },
                // { phoneNumber: identifier } // Change if your field has a different name
            ]
        }
    });

    if (!user) {
        return res.status(404).json({
            message: "User not found."
        });
    }

    return res.json(user);
});



router.get("/many", async (req, res) => {
    const identifiers = req.query.identifiers;

    const values = Array.isArray(identifiers) ? identifiers as string[] : typeof identifiers === "string" ? identifiers.split(",") : [];

    if (values.length === 0) {
        return res.status(400).json({
            message: "identifiers are required.",
        });
    }

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { id: { in: values } },
                { email: { in: values } },
            ],
        },
    });

    return res.json(users);
});