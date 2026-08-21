import type { Request, Response } from "express";
import prisma from "../../config/prisma.js";
import fs from "node:fs/promises";
import path from "node:path";

interface RoomParams {
    roomId: string;
}

interface MemberParams {
    roomId: string;
    userId: string;
}

interface UpdateRoomBody {
    name?: string;
    description?: string;
}

interface AddMembersBody {
    userIds: string[];
}

export async function updateRoom(
    req: Request<RoomParams, unknown, UpdateRoomBody>,
    res: Response
) {
    try {
        const { roomId } = req.params;
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
export async function addMembers(req: Request<RoomParams, unknown, AddMembersBody>, res: Response) {
    try {
        const { roomId } = req.params;
        const { userIds } = req.body;
        const userId = req.user.id;

        const admin = await prisma.roomMembers.findUnique({
            where: { roomId_userId: { roomId, userId } }
        });

        if (!admin) {
            return res.status(403).json({ message: "You are not a member of this room" });
        }

        if (admin.role !== "admin") {
            return res.status(403).json({ message: "Only admins can add members" });
        }

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true }
        });

        if (users.length !== userIds.length) {
            return res.status(400).json({ message: "One or more users do not exist" });
        }

        const existingMembers = await prisma.roomMembers.findMany({
            where: {
                roomId,
                userId: { in: userIds }
            },
            select: { userId: true }
        });

        const existingIds = new Set(existingMembers.map(member => member.userId));

        const membersToAdd = userIds
            .filter(id => !existingIds.has(id))
            .map(userId => ({
                roomId,
                userId,
                role: "client" as const
            }));

        if (membersToAdd.length === 0) {
            return res.status(400).json({ message: "All users are already members" });
        }

        await prisma.roomMembers.createMany({ data: membersToAdd });

        return res.status(201).json({
            message: "Members added successfully",
            addedUserIds: membersToAdd.map(member => member.userId)
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({ message: "Failed to add members" });
    }
}

export async function removeMember(req: Request<MemberParams>, res: Response) {
    try {
        const { roomId, userId: targetUserId } = req.params;
        const userId = req.user.id;

        if (userId === targetUserId) {
            return res.status(400).json({ message: "Use the leave endpoint to remove yourself" });
        }

        const admin = await prisma.roomMembers.findUnique({
            where: { roomId_userId: { roomId, userId } }
        });

        if (!admin) {
            return res.status(403).json({ message: "You are not a member of this room" });
        }

        if (admin.role !== "admin") {
            return res.status(403).json({ message: "Only admins can remove members" });
        }

        const targetMember = await prisma.roomMembers.findUnique({
            where: { roomId_userId: { roomId, userId: targetUserId } }
        });

        if (!targetMember) {
            return res.status(404).json({ message: "User is not a member of this room" });
        }

        await prisma.roomMembers.delete({
            where: { roomId_userId: { roomId, userId: targetUserId } }
        });

        return res.json({ message: "Member removed successfully" });
    } catch (error) {
        console.error(error);

        return res.status(500).json({ message: "Failed to remove member" });
    }
}

export async function leaveRoom(req: Request<RoomParams>, res: Response) {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        const member = await prisma.roomMembers.findUnique({
            where: { roomId_userId: { roomId, userId } }
        });

        if (!member) {
            return res.status(404).json({
                message: "You are not a member of this room"
            });
        }

        await prisma.$transaction(async tx => {
            if (member.role === "admin") {
                const otherAdmins = await tx.roomMembers.findMany({
                    where: {
                        roomId,
                        role: "admin",
                        userId: { not: userId }
                    },
                    select: { userId: true }
                });

                if (otherAdmins.length === 0) {
                    return res.status(500).json({
                        message: "Don't leave."
                    });
                }
            }

            await tx.roomMembers.delete({
                where: {
                    roomId_userId: {
                        roomId,
                        userId
                    }
                }
            });
        });

        return res.json({ message: "You left the room successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to leave room" });
    }
}