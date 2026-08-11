import cors from "cors";
import express from "express";
import morgan from "morgan";
import { createServer } from "node:https";
import { SocketServer } from "./config/socket.js";
import { router } from "./routes/index.js";
import { ChatSocket } from "./sockets/chat/index.js";
import { CallSocket } from "./sockets/call/index.js";
import fs from "fs"
import path from "node:path";

const app = express();

const server = createServer({
    key: fs.readFileSync("./certs/dev-key.pem"),
    cert: fs.readFileSync("./certs/dev-cert.pem"),
}, app)


await new SocketServer()
    .register(new ChatSocket())
    .register(new CallSocket())
    .init(server)


app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(morgan("dev"))
app.use(express.json());
app.use('/api', router)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


export { server }