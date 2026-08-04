import type { Namespace, Socket } from "socket.io";
import prisma from "../../config/prisma.js";
import type { SocketHandler } from "../../config/socket.js";
import { authenticate } from "../authenticate.js";
import { CallManager } from "./CallManager.js";
import { CallEvents } from "./events.js";
import { onCallAccept } from "./handlers/accept-invite.js";
import { onDisconnect } from "./handlers/disconnect.js";
import { onGetRoom } from "./handlers/get-room.js";
import { onCallInit } from "./handlers/init-room.js";
import { onCallLeave } from "./handlers/leave-room.js";
import { onCallReject } from "./handlers/reject-invite.js";
import type { CallContext } from "./types.js";


export class CallSocket implements SocketHandler {
    namespace = "/call";
    private io!: Namespace;
    callManager!: CallManager;

    init(io: Namespace) {
        this.io = io;

        console.log("Call server inited");

        // io.use() callbacks that throw don't reject cleanly, so wrap in a catch.
        this.io.use((socket, next) => authenticate(socket, next));

        this.callManager = new CallManager({
            onMemberTimeout: async (room, userId) => {
                try {
                    const user = await prisma.user.findUnique({
                        where: { id: userId },
                    });

                    if (!user) {
                        console.warn(`Timeout fired for unknown user ${userId} in room ${room.id}`);
                        return;
                    }

                    console.log(`${user.name} timed out in call ${room.id}`);

                    this.io.to(room.id).emit(CallEvents.RejectBroadcast, { user });

                    const sockets = await this.io.in(`user:${userId}`).fetchSockets();
                    for (const socket of sockets) {
                        try {
                            socket.leave(room.id);
                        } catch (err) {
                            console.error(`Failed to remove socket ${socket.id} from room ${room.id}:`, err);
                        }
                    }
                } catch (err) {
                    console.error(`Error handling member timeout for user ${userId} in room ${room.id}:`, err);
                }
            },
        });

        this.io.on("connection", (socket) => {
            this.onConnect(socket).catch((err) => {
                console.error(`Unexpected error on connection for socket ${socket.id}:`, err);
            });
        });
    }




    private async onConnect(socket: Socket) {
        // Guard against a broken auth middleware slipping a socket through without user data.
        if (!socket.data?.user?.id) {
            console.error(`Socket ${socket.id} connected without user data, disconnecting`);
            socket.disconnect(true);
            return;
        }

        const safe = <A extends unknown[]>(handler: (...args: A) => unknown | Promise<unknown>) => {
            return (...args: A) => {
                Promise.resolve(handler(...args)).catch((err) => {
                    console.error(
                        `Error in handler for socket ${socket.id} (${socket.data.user?.name}):`,
                        err
                    );
                    socket.emit(CallEvents.Error, { message: "Internal server error" });
                });
            };
        };
        socket.on(CallEvents.Init, safe((data, callback) => onCallInit(this.ctx(), socket, data, callback)));
        socket.on(CallEvents.Accept, safe((data, callback) => onCallAccept(this.ctx(), socket, data, callback)));
        socket.on(CallEvents.Reject, safe((data, callback) => onCallReject(this.ctx(), socket, data, callback)));
        socket.on(CallEvents.GetRoom, safe((roomId, cb) => onGetRoom(this.ctx(), roomId, cb)));
        socket.on(CallEvents.Leave, safe((data, callback) => onCallLeave(this.ctx(), socket, data, callback)));


        socket.on("disconnect", () => {
            onDisconnect(this.ctx(), socket).catch((err) => {
                console.error(`Error handling disconnect for socket ${socket.id}:`, err);
            });
        });

        socket.on("error", (err) => {
            console.error(`Socket transport error for ${socket.id} (${socket.data.user?.name}):`, err);
        });
    }


    private ctx() {
        return {
            io: this.io,
            callManager: this.callManager,
        } satisfies CallContext;
    }
}