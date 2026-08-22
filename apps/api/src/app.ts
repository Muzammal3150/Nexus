import cors from "cors";
import express from "express";
import morgan from "morgan";
import { createServer } from "node:http";
import { router } from "./routes/index.js";
import fs from "fs"
import path from "node:path";
import { socketServer } from "./config/socket.js";
const app = express();

// const server = createServer({
//     key: fs.readFileSync("./certs/dev-key.pem"),
//     cert: fs.readFileSync("./certs/dev-cert.pem"),
// }, app)
const server = createServer(app)


socketServer.init(server)

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(morgan("dev"))
app.use(express.json());
app.use('/api', router)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


export { server }