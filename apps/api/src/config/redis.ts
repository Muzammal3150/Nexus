import { createClient, type RedisClientType } from "redis";

export const pubClient = createClient({
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
});

export const subClient: RedisClientType = pubClient.duplicate();

export async function connectRedis() {
    pubClient.on("error", (err) => {
        console.error("Redis Pub Error:", err);
    });

    subClient.on("error", (err) => {
        console.error("Redis Sub Error:", err);
    });

    await Promise.all([
        pubClient.connect(),
        subClient.connect(),
    ]);

    console.log("Redis connected");
}