import type { Request, Response } from "express";
import prisma from "../../config/prisma.js";
import fs from "node:fs/promises";
import path from "node:path";

interface RoomParams {
    roomId: string;
}



interface UpdateRoomBody {
    name?: string;
    description?: string;
}


export async function updateRoom(req: Request, res: Response) {
    try {
        const { roomId } = req.params as RoomParams;
        const { name, description } = req.body;
        const userId = req.user.id;

        const member = await prisma.roomMembers.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId
                }
            }
        });

        if (!member) {
            return res.status(403).json({
                message: "You are not a member of this room"
            });
        }

        if (member.role !== "admin") {
            return res.status(403).json({
                message: "Only admins can update the room"
            });
        }

        const existingRoom = await prisma.room.findUnique({
            where: { id: roomId },
            select: { avatar: true }
        });

        if (!existingRoom) {
            return res.status(404).json({
                message: "Room not found"
            });
        }

        const data: {
            name?: string;
            description?: string;
            avatar?: string;
        } = {};

        if (name !== undefined) {
            const trimmedName = name.trim();

            if (!trimmedName) {
                return res.status(400).json({
                    message: "Group name is required"
                });
            }

            if (trimmedName.length > 60) {
                return res.status(400).json({
                    message: "Group name cannot exceed 60 characters"
                });
            }

            data.name = trimmedName;
        }

        if (description !== undefined) {
            const trimmedDescription = description.trim();

            if (trimmedDescription.length > 200) {
                return res.status(400).json({
                    message: "Description cannot exceed 200 characters"
                });
            }

            data.description = trimmedDescription;
        }

        if (req.file) {
            data.avatar = `/uploads/rooms/${req.file.filename}`;
        }

        const room = await prisma.room.update({
            where: { id: roomId },
            data
        });

        // Delete the old avatar after the database update succeeds.
        if (req.file && existingRoom.avatar) {
            const oldAvatarPath = path.resolve(
                existingRoom.avatar.replace(/^\/+/, "")
            );

            try {
                await fs.unlink(oldAvatarPath);
            } catch {
                // Old avatar may already have been deleted.
            }
        }

        return res.json(room);
    } catch (error) {
        console.error("Failed to update room:", error);

        // If the DB update failed after multer saved the file,
        // remove the newly uploaded file so it doesn't become orphaned.
        if (req.file) {
            try {
                await fs.unlink(req.file.path);
            } catch { }
        }

        return res.status(500).json({
            message: "Failed to update room"
        });
    }
}
