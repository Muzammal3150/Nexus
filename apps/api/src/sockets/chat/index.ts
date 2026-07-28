

import type { ExtendedError, Namespace, Socket } from "socket.io";
import type { SocketHandler } from "../../config/socket.js";
import { auth } from "../../config/auth.js";
import prisma from "../../config/prisma.js";
import { getAllRooms } from "../../routes/room.js";

export class ChatSocket implements SocketHandler {
    namespace = "/chat"
    private io!: Namespace

    init(io: Namespace) {
        this.io = io
        console.log("Chat server inited")
        this.io.use(this.authenticate);

        this.io.on("connection", this.onConnect.bind(this))

    }

    private async authenticate(socket: Socket, next: (err?: ExtendedError) => void) {
        const headers = new Headers(socket.handshake.headers as Record<string, string>)
        const session = await auth.api.getSession({ headers });

        if (!session) {
            return next(new Error("Unauthorized"));
        }

        socket.data.user = session.user;
        socket.data.session = session.session;

        console.log("User connected", socket.data.user.name)
        next();
    }

    private async onConnect(socket: Socket) {

        await this.joinAllRooms(socket)
        socket.on("chat:text", (data) => this.onText(socket, data));
        // socket.on("room:join", (roomId) => this.joinRoom(socket, roomId));
        socket.on("room:create", (data, callback) => this.createRoom(socket, data, callback));
    }

    private async joinAllRooms(socket: Socket) {
        const rooms = await getAllRooms(socket.data.user.id)

        socket.join(rooms.map(({ id }) => id))
        console.log("Joined Rooms", socket.data.user, rooms)
    }
    private joinRoom(socket: Socket, roomId: string) {
        console.log("joinRoom", roomId)
        socket.join(roomId)
    }


    private async createRoom(socket: Socket, data: {
        name: string;
        memberIds: string[];
        isGroup: boolean;
    }, callback: (result: { success: true; alreadyExists?: boolean; room?: unknown }) => void) {
        const memberIds = [...new Set([...data.memberIds, socket.data.user.id])];
        if (!data.isGroup && memberIds.length == 2) {
            const room = await prisma.room.findFirst({
                where: {
                    isGroup: false,
                    AND: [
                        {
                            members: {
                                some: {
                                    userId: memberIds[0],
                                },
                            },
                        },
                        {
                            members: {
                                some: {
                                    userId: memberIds[1],
                                },
                            },
                        },
                    ],
                },
                include: {
                    members: true,
                },
            });

            if (
                room &&
                room.members.length === 2 &&
                room.members.some(m => m.userId === memberIds[0]) &&
                room.members.some(m => m.userId === memberIds[1])
            ) {
                return callback({
                    success: true,
                    alreadyExists: true,
                    room,
                });
            }
        }

        const newRoom = await prisma.room.create({
            data: {
                name: data.name,
                isGroup: data.isGroup,
                members: {
                    create: memberIds.map((userId) => ({
                        user: {
                            connect: { id: userId },
                        },
                        role: "client",
                    })),
                },
            },
            include: {
                members: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        const newRoomMemberIds = newRoom.members.map(({ userId }) => userId)
        this.io.sockets.forEach(s => {
            if (newRoomMemberIds.includes(s.data.user.id)) {
                console.log('includes')
                s.emit("room:create-broadcast", newRoom)
            }
        })

        return callback({ success: true, room: newRoom })
    }


    private onText(socket: Socket, data: { roomId: string, body: string }) {
        const { body, roomId } = data

        const payload = {
            id: crypto.randomUUID(),
            sender: socket.data.user,
            body,
            sendedAt: new Date(),
            roomId,
        }

        socket.to(roomId).emit("chat:text", payload)
        socket.emit("chat:text", { ...payload, isMine: true })
    }
}

