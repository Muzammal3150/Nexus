import cors from "cors";
import express from "express";
import morgan from "morgan";
import { createServer } from "node:https";
import { connectRedis } from "./config/redis.js";
import { SocketServer } from "./config/socket.js";
import { router } from "./routes/index.js";
import { ChatSocket } from "./sockets/chat/index.js";
import { CallSocket } from "./sockets/call/index.js";
import fs from "fs"
import path from "node:path";

const app = express();

export const server = createServer({
    key: fs.readFileSync("./certs/dev-key.pem"),
    cert: fs.readFileSync("./certs/dev-cert.pem"),
}, app)

await connectRedis()

new SocketServer(server)
    .register(new ChatSocket())
    .register(new CallSocket())
    .init()


app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(morgan("dev"))
app.use(express.json());
app.use('/api', router)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

