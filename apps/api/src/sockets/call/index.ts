import type { Namespace, Socket } from "socket.io";
import prisma from "../../config/prisma.js";
import type { SocketHandler } from "../../config/socket.js";
import { authenticate } from "../authenticate.js";
import { CallManager } from "./CallManager.js";
import { CallEvents } from "./events.js";
import { onCallAccept } from "./handlers/onCallAccept.js";
import { onCallInit } from "./handlers/onCallInit.js";
import { onCallLeave } from "./handlers/onCallLeave.js";
import { onDisconnect } from "./handlers/onDisconnect.js";
import { onGetRoom } from "./handlers/onGetRoom.js";
import { onCallReject } from "./handlers/onCallReject.js";
import { onRTCAnswer } from "./handlers/onRTCAnswer.js";
import { onRTCOffer } from "./handlers/onRTCOffer.js";
import type { CallContext } from "./types.js";
import { onCallReady } from "./handlers/onCallReady.js";
import { onRTCIceCandidate } from "./handlers/onRTCIceCandidate.js";


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
        socket.on(CallEvents.Init, safe((data, cb) => onCallInit(this.ctx(), socket, data, cb)));
        socket.on(CallEvents.Accept, safe((data, cb) => onCallAccept(this.ctx(), socket, data, cb)));
        socket.on(CallEvents.Ready, (data) => onCallReady(socket, data));
        socket.on(CallEvents.Reject, safe((data, cb) => onCallReject(this.ctx(), socket, data, cb)));
        socket.on(CallEvents.GetRoom, safe((roomId, cb) => onGetRoom(this.ctx(), roomId, cb)));
        socket.on(CallEvents.Leave, safe((data, cb) => onCallLeave(this.ctx(), socket, data, cb)));

        socket.on(CallEvents.Offer, safe((data, cb) => onRTCOffer(this.ctx(), socket, data, cb)));
        socket.on(CallEvents.Answer, safe((data, cb) => onRTCAnswer(this.ctx(), socket, data, cb)));
        socket.on(CallEvents.IceCandidate, safe((data, cb) => onRTCIceCandidate(this.ctx(), socket, data, cb)));

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