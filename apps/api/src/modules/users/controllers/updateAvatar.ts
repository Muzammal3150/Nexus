import type { Request, Response } from "express";
import { auth } from "../../../config/auth.js";

export async function updateAvatar(req: Request, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Avatar is required." });
        }

        const image = `/uploads/avatars/${req.file.filename}`;

        await auth.api.updateUser({
            headers: req.headers,
            body: { image },
        });

        return res.status(200).json({
            message: "Avatar updated successfully.",
            image,
        });
        
    } catch {
        return res.status(500).json({ message: "Internal Server Error." });
    }
}