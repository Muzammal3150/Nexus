import cors from "cors";
import express from "express";
import morgan from "morgan";
import { createServer as createHttpServer } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { router } from "./routes/routes.js";
import fs from "node:fs";
import path from "node:path";
import { socketServer } from "./config/socket.js";

const app = express();

const useHttps = process.env.USE_HTTPS === "true";

const server = useHttps
    ? createHttpsServer({
        key: fs.readFileSync("./certs/dev-key.pem"),
        cert: fs.readFileSync("./certs/dev-cert.pem"),
    }, app)
    
    : createHttpServer(app);

socketServer.init(server);

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use("/api", router);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

export { server };