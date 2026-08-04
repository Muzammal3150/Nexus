import type { Namespace, Socket } from "socket.io";
import type { SocketHandler } from "../../config/socket.js";
import { getAllRooms } from "../../routes/room.js";
import { authenticate } from "../authenticate.js";
import { ChatEvents } from "./events.js";
import { createRoom } from "./handlers/create-room.js";
import { onText } from "./handlers/text-message.js";



export class ChatSocket implements SocketHandler {
    namespace = "/chat";
    private io!: Namespace;

    init(io: Namespace) {
        this.io = io;
        console.log("Chat server inited");

        this.io.use((socket, next) => authenticate(socket, next));
        this.io.on("connection", async (socket) => {
            await this.onConnect(socket).catch((err) => {
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

        const safe = <A extends unknown[]>(handler: (...args: A) => unknown | Promise<unknown>) => {
            return (...args: A) => {
                Promise.resolve(handler(...args)).catch((err) => {
                    console.error(`Error in chat handler for socket ${socket.id} (${socket.data.user?.name}):`, err);
                    socket.emit(ChatEvents.Error, { message: "Internal server error" });
                });
            };
        };

        await this.joinAllRooms(socket);

        socket.on(ChatEvents.Chat.Text, safe((data) => onText(socket, data)));
        socket.on(ChatEvents.Room.Create, safe((data, callback) => createRoom(this.ctx(), socket, data, callback)));

        socket.on("error", (err) => {
            console.error(`Chat socket transport error for ${socket.id} (${socket.data.user?.name}):`, err);
        });
    }



    private async joinAllRooms(socket: Socket) {
        try {
            const rooms = await getAllRooms(socket.data.user.id);
            if (!rooms || rooms.length === 0) return;

            socket.join(rooms.map(({ id }) => id));
        } catch (err) {
            console.error(`Failed to join existing rooms for user ${socket.data.user.id}:`, err);
            socket.emit(ChatEvents.Error, { message: "Failed to load your conversations" });
        }
    }

    private ctx() {
        return { io: this.io }
    }

}