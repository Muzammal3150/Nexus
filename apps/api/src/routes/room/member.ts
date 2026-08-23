import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../../config/prisma.js";
import { RoomRole } from "../../generated/prisma/enums.js";
import { sysMessage } from "../../sockets/chat/sysMsg.js";

interface MemberParams {
    roomId: string;
    userId: string;
}

interface RoomParams {
    roomId: string;
}

const addMembersSchema = z.object({
    userIds: z.array(z.string().trim().min(1)).min(1, "At least one user is required"),
});

const updateMemberSchema = z.object({
    role: z.enum([RoomRole.admin, RoomRole.member]).optional(),
});

export async function addMembers(
    req: Request<RoomParams, unknown, unknown>,
    res: Response,
) {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        const result = addMembersSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: result.error.issues[0]?.message ?? "Invalid request",
            });
        }

        const userIds = [...new Set(result.data.userIds)];

        const admin = await prisma.roomMembers.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId,
                },
            },
            select: {
                role: true,
            },
        });

        if (!admin) {
            return res.status(403).json({
                message: "You are not a member of this room",
            });
        }

        if (admin.role !== RoomRole.admin) {
            return res.status(403).json({
                message: "Only admins can add members",
            });
        }

        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: userIds,
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        if (users.length !== userIds.length) {
            return res.status(400).json({
                message: "One or more users do not exist",
            });
        }

        const existingMembers = await prisma.roomMembers.findMany({
            where: {
                roomId,
                userId: {
                    in: userIds,
                },
            },
            select: {
                userId: true,
            },
        });

        const existingIds = new Set(
            existingMembers.map((member) => member.userId),
        );

        const usersToAdd = users.filter(
            (user) => !existingIds.has(user.id),
        );

        if (!usersToAdd.length) {
            return res.status(400).json({
                message: "All users are already members",
            });
        }

        await prisma.roomMembers.createMany({
            data: usersToAdd.map((user) => ({
                roomId,
                userId: user.id,
                role: RoomRole.member,
            })),
        });

        for (const user of usersToAdd) {
            sysMessage({
                roomId,
                code: "MEMBER_ADDED",
                message: `${user.name} was added to the group`,
            });
        }

        return res.status(201).json({
            message: "Members added successfully",
            addedUserIds: usersToAdd.map((user) => user.id),
        });
    } catch (error) {
        console.error("Failed to add members:", error);

        return res.status(500).json({
            message: "Failed to add members",
        });
    }
}

export async function removeMember(
    req: Request<MemberParams>,
    res: Response,
) {
    try {
        const { roomId, userId: targetUserId } = req.params;
        const userId = req.user.id;

        if (userId === targetUserId) {
            return res.status(400).json({
                message: "Use the leave endpoint to remove yourself",
            });
        }

        const admin = await prisma.roomMembers.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId,
                },
            },
            select: {
                role: true,
            },
        });

        if (!admin) {
            return res.status(403).json({
                message: "You are not a member of this room",
            });
        }

        if (admin.role !== RoomRole.admin) {
            return res.status(403).json({
                message: "Only admins can remove members",
            });
        }

        const targetMember = await prisma.roomMembers.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId: targetUserId,
                },
            },
            select: {
                userId: true,
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!targetMember) {
            return res.status(404).json({
                message: "User is not a member of this room",
            });
        }

        await prisma.roomMembers.delete({
            where: {
                roomId_userId: {
                    roomId,
                    userId: targetUserId,
                },
            },
        });

        sysMessage({
            roomId,
            code: "MEMBER_REMOVED",
            message: `${targetMember.user.name} was removed from the group`,
        });

        return res.json({
            message: "Member removed successfully",
        });
    } catch (error) {
        console.error("Failed to remove member:", error);

        return res.status(500).json({
            message: "Failed to remove member",
        });
    }
}

export async function updateMember(
    req: Request<MemberParams>,
    res: Response,
) {
    try {
        const { roomId, userId: targetUserId } = req.params;
        const userId = req.user.id;

        const result = updateMemberSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid member update",
                errors: result.error.flatten().fieldErrors,
            });
        }

        const { role } = result.data;

        if (role === undefined) {
            return res.status(400).json({
                message: "No updates provided",
            });
        }

        if (userId === targetUserId) {
            return res.status(400).json({
                message: "You cannot update your own member settings",
            });
        }

        const admin = await prisma.roomMembers.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId,
                },
            },
            select: {
                role: true,
            },
        });

        if (!admin) {
            return res.status(403).json({
                message: "You are not a member of this room",
            });
        }

        if (admin.role !== RoomRole.admin) {
            return res.status(403).json({
                message: "Only admins can update members",
            });
        }

        const targetMember = await prisma.roomMembers.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId: targetUserId,
                },
            },
            select: {
                role: true,
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!targetMember) {
            return res.status(404).json({
                message: "User is not a member of this room",
            });
        }

        if (targetMember.role === role) {
            return res.status(400).json({
                message: "Member already has this role",
            });
        }

        const updatedMember = await prisma.roomMembers.update({
            where: {
                roomId_userId: {
                    roomId,
                    userId: targetUserId,
                },
            },
            data: {
                role,
            },
        });

        const isPromotion = role === RoomRole.admin;

        sysMessage({
            roomId,
            code: isPromotion
                ? "MEMBER_PROMOTED"
                : "MEMBER_DEMOTED",
            message: isPromotion
                ? `${targetMember.user.name} was promoted to admin`
                : `${targetMember.user.name} was demoted to member`,
        });

        return res.json({
            message: "Member updated successfully",
            member: updatedMember,
        });
    } catch (error) {
        console.error("Failed to update member:", error);

        return res.status(500).json({
            message: "Failed to update member",
        });
    }
}

export async function leaveRoom(
    req: Request<RoomParams>,
    res: Response,
) {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        const member = await prisma.roomMembers.findUnique({
            where: {
                roomId_userId: {
                    roomId,
                    userId,
                },
            },
            select: {
                role: true,
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!member) {
            return res.status(404).json({
                message: "You are not a member of this room",
            });
        }

        let roomDeleted = false;

        await prisma.$transaction(async (tx) => {
            const remainingMembers = await tx.roomMembers.count({
                where: {
                    roomId,
                    userId: {
                        not: userId,
                    },
                },
            });

            if (remainingMembers < 2) {
                await tx.room.delete({
                    where: {
                        id: roomId,
                    },
                });

                roomDeleted = true;
                return;
            }

            if (member.role === RoomRole.admin) {
                const otherAdmin = await tx.roomMembers.findFirst({
                    where: {
                        roomId,
                        role: RoomRole.admin,
                        userId: {
                            not: userId,
                        },
                    },
                    select: {
                        userId: true,
                    },
                });

                if (!otherAdmin) {
                    throw new Error("LAST_ADMIN");
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

        if (!roomDeleted) {
            sysMessage({
                roomId,
                code: "MEMBER_LEFT",
                message: `${member.user.name} left the group`,
            });
        }

        return res.json({
            message: "You left the room successfully",
        });
    } catch (error) {
        if (error instanceof Error && error.message === "LAST_ADMIN") {
            return res.status(400).json({
                message: "You cannot leave while you are the only admin",
            });
        }

        console.error("Failed to leave room:", error);

        return res.status(500).json({
            message: "Failed to leave room",
        });
    }
}