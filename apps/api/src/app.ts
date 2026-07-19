import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { type Application } from "express";
import morgan from "morgan";
import { auth } from "./config/auth.js";
import { router } from "./routes/index.js";
export const app: Application = express();


app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(morgan("dev"))
app.use(express.json());


app.get("/ping", (req, res) => {

    res.json({ ok: true });
});

app.all("/api/auth/*splat", toNodeHandler(auth)); // Express 5
app.use("/api", router);