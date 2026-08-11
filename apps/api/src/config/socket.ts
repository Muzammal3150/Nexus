import { createAdapter } from "@socket.io/redis-adapter";
import { type Server as HttpServer } from "node:http";
import { Namespace, Server } from "socket.io";
import { redis } from "./redis.js";





export interface SocketHandler {
    namespace: string;
    init(namespace: Namespace): void;
}

export class SocketServer {
    private io!: Server;
    private handlers: SocketHandler[] = [];

    register(handler: SocketHandler) {
        this.handlers.push(handler);
        return this;
    }

    async init(httpServer: HttpServer) {

        const pubClient = redis.duplicate()
        const subClient = redis.duplicate()

        await pubClient.connect()
        await subClient.connect()

        this.io = new Server(httpServer, {
            adapter: createAdapter(pubClient, subClient),
            cors: {
                origin: process.env.FRONTEND_URL,
                credentials: true,
            },
        });


        for (const handler of this.handlers) {
            const namespace = this.io.of(handler.namespace);
            handler.init(namespace);
        }

        return this;
    }
}