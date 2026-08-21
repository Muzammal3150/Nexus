import type { Socket } from "socket.io";
import prisma from "../../../config/prisma.js";
import { ChatEvents } from "../events.js";
import type { ChatContext } from "../types.js";

export async function onRoomCreate(ctx: ChatContext, socket: Socket, data: unknown) {
    if (!data || typeof data !== "object" || !("roomId" in data)) {
        return;
    }

    const roomId = (data as { roomId: unknown }).roomId;

    if (typeof roomId !== "string") {
        return;
    }

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            members: {
                select: {
                    userId: true,
                },
            },
        },
    });

    if (!room) {
        return;
    }

    const creatorId = socket.data.user.id;

    const isMember = room.members.some(
        (member) => member.userId === creatorId,
    );

    if (!isMember) {
        return;
    }

    for (const member of room.members) {

        const sockets = await ctx.io
            .in(`user:${member.userId}`)
            .fetchSockets();

        for (const memberSocket of sockets) {
            memberSocket.join(room.id);
        }

        ctx.io.to(`user:${member.userId}`).emit(
            ChatEvents.Room.CreateBroadcast,
            room,
        );
    }
}