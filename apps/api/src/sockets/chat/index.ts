import type { Namespace, Socket } from "socket.io";
import type { SocketHandler } from "../../config/socket.js";
import { getAllRooms } from "../../routes/room.js";
import { authenticate } from "../authenticate.js";
import { ChatEvents } from "./events.js";
import { createRoom } from "./handlers/createRoom.js";
import { onText } from "./handlers/onText.js";
import { initSafe } from "./safeAck.js";
import { onFileSend } from "./handlers/onFileSend.js";
import type { Session } from "better-auth";
import type { Room } from "../../generated/prisma/client.js";
import { redis } from "../../config/redis.js";
import { onMessageReceived } from "./handlers/onMessageRecieved.js";



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



    private async onConnect(socket: Socket) {
        if (!socket.data?.user?.id) {
            console.error(`Chat socket ${socket.id} connected without user data, disconnecting`);
            socket.disconnect(true);
            return;
        }

        const safe = initSafe((err) => {
            console.error(`Error in chat handler for socket ${socket.id} (${socket.data.user?.name}):`, err);
            socket.emit(ChatEvents.Error, { message: "Internal server error" });
        });


        const rooms = await this.joinAllRooms(socket);
        if (!rooms) {
            return;
        }


        socket.on(ChatEvents.Room.Create, safe((data, callback) => createRoom(this.ctx(), socket, data, callback)));
        socket.on(ChatEvents.Chat.Text, safe((data) => onText(socket, data)));
        socket.on(ChatEvents.Chat.File, safe((data) => onFileSend(socket, data)));
        socket.on(ChatEvents.Chat.Received, safe((data) => onMessageReceived(socket, data)));

        socket.on("error", (err) => {
            console.error(`Chat socket transport error for ${socket.id} (${socket.data.user?.name}):`, err);
        });

        await this.syncMessages(socket, rooms)
    }



    private async joinAllRooms(socket: Socket) {
        try {
            const rooms = await getAllRooms(socket.data.user.id);
            if (!rooms || rooms.length === 0) return;

            socket.join(rooms.map(({ id }) => id));

            return rooms

        } catch (err) {
            console.error(`Failed to join existing rooms for user ${socket.data.user.id}:`, err);
            socket.emit(ChatEvents.Error, { message: "Failed to load your conversations" });
        }
    }


    private async syncMessages(socket: Socket, rooms: Room[]) {

        for (const room of rooms) {
            const streamId =
                await redis.hGet(
                    `nexsus:chat:sync:${room.id}`,
                    socket.data.session.id
                ) ??
                `${(socket.data.session as Session).createdAt.getTime()}-0`;

                
            const messages = await redis.xRange(
                `nexsus:chat:room:${room.id}`,
                `(${streamId}`,
                "+"
            );

            for (const message of messages) {
                socket.emit(message.message.event as string, JSON.parse(message.message.payload as string))
            }


            await redis.hSet(
                `nexsus:chat:sync:${room.id}`,
                socket.data.session.id,
                messages.length > 0 ? messages.at(-1)!.id : `${Date.now()}-0`
            );

        }
        // }
    }

    private ctx() {
        return { io: this.io }
    }

}

