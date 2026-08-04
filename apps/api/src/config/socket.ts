import { createAdapter } from "@socket.io/redis-adapter";
import { type Server as HttpServer } from "node:http";
import { Namespace, Server } from "socket.io";
import { pubClient, subClient } from "./redis.js";




export interface SocketHandler {
    namespace: string;
    init(namespace: Namespace): void;
}

export class SocketServer {
    private io: Server;
    private handlers: SocketHandler[] = [];

    constructor(httpServer: HttpServer) {

        this.io = new Server(httpServer, {
            adapter: createAdapter(pubClient, subClient),
            cors: {
                origin: process.env.FRONTEND_URL,
                credentials: true,
            },
        });
    }

    register(handler: SocketHandler) {
        this.handlers.push(handler);
        return this;
    }

    init() {
        for (const handler of this.handlers) {
            const namespace = this.io.of(handler.namespace);
            handler.init(namespace);
        }

        return this;
    }
}