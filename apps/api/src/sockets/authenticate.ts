import type { ExtendedError, Socket } from "socket.io";
import { auth } from "../config/auth.js";



export async function authenticate(socket: Socket, next: (err?: ExtendedError) => void) {
    try {
        const headers = new Headers(socket.handshake.headers as Record<string, string>);
        const session = await auth.api.getSession({ headers });

        if (!session || !session.user || !session.session) {
            return next(new Error("Unauthorized"));
        }

        socket.data.user = session.user;
        socket.data.session = session.session;


        socket.join(`user:${socket.data.user.id}`);

        console.log("User connected to chat server", socket.data.user.name);
        next();

    } catch (err) {
        console.error("Error during socket authentication:", err);
        next(new Error("Authentication error"));
    }
}