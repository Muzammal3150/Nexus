import { toNodeHandler } from "better-auth/node";
import express, { type Application } from "express";
import { auth } from "./config/auth.js";
import { router } from "./routes/index.js";
import cors from "cors"
export const app: Application = express();

console.log(process.env.FRONTEND_URL)
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(express.json());


app.get("/ping", (req, res) => {

    res.json({ ok: true });
});

app.all("/api/auth/*splat", toNodeHandler(auth)); // Express 5
app.use("/api", router);