import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../../config/prisma.js";
import fs from "node:fs/promises";
import path from "node:path";
import { sysMessage } from "../../sockets/chat/sysMsg.js";

interface RoomParams {
    roomId: string;
}

const updateRoomSchema = z.object({
    name: z.string().trim().min(1, "Group name is required").max(60, "Group name cannot exceed 60 characters").optional(),
    description: z.string().trim().max(200, "Description cannot exceed 200 characters").optional(),
});

export async function updateRoom(req: Request<RoomParams>, res: Response) {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        const result = updateRoomSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: result.error.issues[0]?.message ?? "Invalid request",
            });
        }

        const { name, description } = result.data;

        const member = await prisma.roomMembers.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId,
                },
            },
        });

        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this room",
            });
        }

        if (member.role !== "admin") {
            return res.status(403).json({
                message: "Only admins can update the room",
            });
        }

        const existingRoom = await prisma.room.findUnique({
            where: { id: roomId },
            select: {
                name: true,
                description: true,
                avatar: true,
            },
        });

        if (!existingRoom) {
            return res.status(404).json({
                message: "Room not found",
            });
        }

        const data = {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(req.file && { avatar: `/uploads/rooms/${req.file.filename}` }),
        };

        if (!Object.keys(data).length) {
            return res.status(400).json({
                message: "No changes provided",
            });
        }

        const nameChanged = name !== undefined && name !== existingRoom.name;
        const descriptionChanged = description !== undefined && description !== existingRoom.description;
        const imageChanged = !!req.file;

        const room = await prisma.room.update({
            where: { id: roomId },
            data,
        });

        if (req.file && existingRoom.avatar) {
            const oldAvatarPath = path.resolve(
                existingRoom.avatar.replace(/^\/+/, ""),
            );

            try {
                await fs.unlink(oldAvatarPath);
            } catch { }
        }

        if (nameChanged) {
            sysMessage({
                roomId,
                code: "GROUP_NAME_CHANGED",
                message: `Group name changed to "${name}"`,
            });
        }

        if (descriptionChanged) {
            sysMessage({
                roomId,
                code: "GROUP_DESCRIPTION_CHANGED",
                message: `Group description changed to ${description}`,
            });
        }

        if (imageChanged) {
            sysMessage({
                roomId,
                code: "GROUP_IMAGE_CHANGED",
                message: "Group image changed",
            });
        }

        return res.json(room);
    } catch (error) {
        console.error("Failed to update room:", error);

        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch { }
        }

        return res.status(500).json({
            message: "Failed to update room",
        });
    }
}