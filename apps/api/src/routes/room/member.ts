import type { Request, Response } from "express";
import prisma from "../../config/prisma.js";
import z from "zod";
import { RoomRole } from "../../generated/prisma/enums.js";


interface MemberParams {
    roomId: string;
    userId: string;
}
interface AddMembersBody {
    userIds: string[];
}
interface RoomParams {
    roomId: string;
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
                role: "member" as const
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

const updateMemberSchema = z.object({
    role: z.enum([RoomRole.admin, RoomRole.member]).optional(),
});

export async function updateMember(req: Request<MemberParams>, res: Response) {
    try {
        const { roomId, userId: targetUserId } = req.params;
        const userId = req.user.id;

        const result = updateMemberSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: 'Invalid member update',
                errors: result.error.flatten().fieldErrors,
            });
        }

        const data = result.data;

        if (!Object.keys(data).length) {
            return res.status(400).json({
                message: 'No updates provided',
            });
        }

        if (userId === targetUserId) {
            return res.status(400).json({
                message: 'You cannot update your own member settings',
            });
        }

        const admin = await prisma.roomMembers.findUnique({
            where: { roomId_userId: { roomId, userId } },
            select: { role: true },
        });

        if (!admin) {
            return res.status(403).json({
                message: 'You are not a member of this room',
            });
        }

        if (admin.role !== 'admin') {
            return res.status(403).json({
                message: 'Only admins can update members',
            });
        }

        const targetMember = await prisma.roomMembers.findUnique({
            where: { roomId_userId: { roomId, userId: targetUserId } },
        });

        if (!targetMember) {
            return res.status(404).json({
                message: 'User is not a member of this room',
            });
        }

        const updatedMember = await prisma.roomMembers.update({
            where: { roomId_userId: { roomId, userId: targetUserId } },
            data: { role: data.role! },
        });

        return res.json({
            message: 'Member updated successfully',
            member: updatedMember,
        });
    } catch (error) {
        console.error('Failed to update member:', error);

        return res.status(500).json({
            message: 'Failed to update member',
        });
    }
}
export async function leaveRoom(req: Request<RoomParams>, res: Response) {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        const member = await prisma.roomMembers.findUnique({
            where: { roomId_userId: { roomId, userId } },
        });

        if (!member) {
            return res.status(404).json({
                message: 'You are not a member of this room',
            });
        }

        await prisma.$transaction(async (tx) => {
            const remainingMembers = await tx.roomMembers.count({
                where: {
                    roomId,
                    userId: { not: userId },
                },
            });

            if (remainingMembers < 2) {
                await tx.room.delete({
                    where: { id: roomId },
                });

                return;
            }

            if (member.role === 'admin') {
                const otherAdmin = await tx.roomMembers.findFirst({
                    where: {
                        roomId,
                        role: 'admin',
                        userId: { not: userId },
                    },
                    select: { userId: true },
                });

                if (!otherAdmin) {
                    throw new Error('LAST_ADMIN');
                }
            }

            await tx.roomMembers.delete({
                where: {
                    roomId_userId: {
                        roomId,
                        userId,
                    },
                },
            });
        });

        return res.json({
            message: 'You left the room successfully',
        });
    } catch (error) {
        if (error instanceof Error && error.message === 'LAST_ADMIN') {
            return res.status(400).json({
                message: 'You cannot leave while you are the only admin',
            });
        }

        console.error(error);

        return res.status(500).json({
            message: 'Failed to leave room',
        });
    }
}