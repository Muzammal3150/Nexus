import type { Session } from "better-auth";
import type { Namespace, Socket } from "socket.io";
import { redis } from "../../config/redis.js";
import type { SocketHandler } from "../../config/socket.js";
import type { Room } from "../../generated/prisma/client.js";
import { authenticate } from "../authenticate.js";
import { ChatEvents } from "./events.js";
import { createRoom } from "./handlers/createRoom.js";
import { onFileSend } from "./handlers/onFileSend.js";
import { onMessageReceived } from "./handlers/onMessageRecieved.js";
import { onPresenceSubscribe } from "./handlers/onSubscribePresence.js";
import { onText } from "./handlers/onText.js";
import { onTyping } from "./handlers/onTyping.js";
import { initSafe } from "./safeAck.js";
import { getAllRooms } from "../../routes/room/get-room.js";



export class ChatSocket implements SocketHandler {
    namespace = "/chat";
    private io!: Namespace;

    init(io: Namespace) {
        this.io = io;
        this.io.use((socket, next) => authenticate(socket, next));
        this.io.on("connection", async (socket) => {
            await this.
                onConnect(socket)
                .catch((err) => {
                    console.error(`Unexpected error on connection for socket ${socket.id}:`, err);
                });
        });
    }


    private validate(socket: Socket) {
        const userId = socket.data.user.id;
        if (!userId) {
            console.error(`Chat socket ${socket.id} connected without user data, disconnecting`);
            socket.disconnect(true);
            return false;
        }

        return true;
    }


    private async onConnect(socket: Socket) {
        if (!(this.validate(socket))) return;
        const userId = socket.data.user.id;
        console.log("User connected to chat Server", socket.data.user.name)


        const safe = initSafe((err) => {
            console.error(`Error in chat handler for socket ${socket.id} (${socket.data.user?.name}):`, err);
            socket.emit(ChatEvents.Error, { message: "Internal server error" });
        });


        const rooms = await this.joinAllRooms(socket);


        socket.on(ChatEvents.Room.Create, safe((data, callback) => createRoom(this.ctx(), socket, data, callback)));
        socket.on(ChatEvents.Chat.Text, safe((data) => onText(socket, data)));
        socket.on(ChatEvents.Chat.File, safe((data) => onFileSend(socket, data)));
        socket.on(ChatEvents.Chat.Received, safe((data) => onMessageReceived(socket, data)));
        socket.on(ChatEvents.Chat.Typing, safe((data) => onTyping(socket, data)));

        socket.on(ChatEvents.Presence.Subscribe, safe((data) => onPresenceSubscribe(socket, data)));


        socket.on("disconnect", safe(() => this.onDisconnect(socket)))
        socket.on("error", (err) => {
            console.error(`Chat socket transport error for ${socket.id} (${socket.data.user?.name}):`, err);
        });


        const lastSeen = Date.now();
        await redis.hSet('nexus:presence', userId, JSON.stringify({
            isOnline: true,
            lastSeen: Date.now(),
        }),
        );
        this.io.to(`presence:${userId}`).emit('presence:update', {
            userId,
            isOnline: true,
            lastSeen,
        });
        if (rooms) await this.syncMessages(socket, rooms)
    }


    private async onDisconnect(socket: Socket) {
        console.log(`${socket.data.user.name} is disconnecting...`)
        const userId = socket.data.user.id;

        const remainingSockets = await this.io.in(`user:${userId}`).fetchSockets();
        if (remainingSockets.length == 0) {
            await redis.hSet('nexus:presence', socket.data.user.id, JSON.stringify({
                isOnline: false,
                lastSeen: Date.now(),
            })
            );
            this.io.to(`presence:${socket.data.user.id}`).emit('presence:update', {
                userId: socket.data.user.id,
                isOnline: false,
                lastSeen: Date.now(),
            });
        }
        console.log(`${socket.data.user.name} is disconnected`)

    }

    private async joinAllRooms(socket: Socket) {
        try {
            const rooms = await getAllRooms(socket.data.user.id);
            if (!rooms || rooms.length === 0) return;

            socket.join(rooms.map(({ id }) => id));

            return rooms

        } catch (err) {
            console.error(`Failed to join existing rooms for user ${socket.data.user.id}: `, err);
            socket.emit(ChatEvents.Error, { message: "Failed to load your conversations" });
        }
    }


    private async syncMessages(socket: Socket, rooms: Room[]) {
        console.log("synicing ...", rooms.map(room => room.name))
        for (const room of rooms) {
            const syncKey = `nexus:chat:sync:${room.id}`;
            const streamKey = `nexus:chat:room:${room.id}`;
            const sessionId = socket.data.session.id;
            const fallbackId = `${(socket.data.session as Session).createdAt.getTime()}-0`;

            const streamId = await redis.hGet(syncKey, sessionId) ?? fallbackId;
            console.log(streamId)
            const messages = await redis.xRange(streamKey, `(${streamId}`, "+");

            for (const message of messages) {
                socket.emit(
                    message.message.event as string,
                    JSON.parse(message.message.payload as string)
                );
            }

            // if (messages.length > 0) {
            //     await redis.hSet(syncKey, sessionId, messages.at(-1)!.id);
            // }
        }
    }

    private ctx() {
        return { io: this.io }
    }

}

