import cors from "cors";
import express from "express";
import morgan from "morgan";
import { createServer } from "node:http";
import { connectRedis } from "./config/redis.js";
import { SocketServer } from "./config/socket.js";
import { router } from "./routes/index.js";
import { ChatSocket } from "./sockets/chat/index.js";
import { CallSocket } from "./sockets/call/index.js";


const app = express();
export const server = createServer(app)

await connectRedis()

new SocketServer(server)
    .register(new ChatSocket())
    .register(new CallSocket())
    .init()


app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(morgan("dev"))
app.use(express.json());
app.use('/api', router)

