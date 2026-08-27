import 'dotenv/config';
import { server } from "./app.js";
import https from "node:https";


const port = Number(process.env.PORT);
const host = process.env.BACKEND_HOSTNAME;
const protocol = server instanceof https.Server ? "https" : "http";

server.listen(port, host, () => {
    console.log(`Server running on ${protocol}://${host}:${port}`);
});