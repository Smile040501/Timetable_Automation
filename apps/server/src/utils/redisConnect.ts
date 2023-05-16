import { createClient } from "redis";
import { environment as env } from "../environment";

export const redisOptions = {
    host: env.redisQueueHost,
    port: env.redisQueuePort,
    connectTimeout: 20000,
};

const redisClient = createClient({
    socket: redisOptions,
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export default redisClient;
