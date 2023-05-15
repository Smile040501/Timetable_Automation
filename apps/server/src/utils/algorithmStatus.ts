/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AlgorithmStatus } from "@ta/shared/utils";

import redisClient from "./redisConnect";
import { environment as env } from "../environment";

export const setRedisAlgorithmStatus = async (
    algorithmStatus: AlgorithmStatus
) => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
    await redisClient.set(env.redisAlgorithmStatusKey!, algorithmStatus);
};

export const getRedisAlgorithmStatus = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    const algorithmStatus = await redisClient.get(env.redisAlgorithmStatusKey!);
    return algorithmStatus;
};
