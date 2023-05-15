import { Queue } from "bullmq";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

import { redisOptions } from "../utils/redisConnect";
import { AlgorithmJobInputData } from "./interface";
import { setUpAlgorithmWorker } from "./workers/algorithm";

export const DEFAULT_REMOVE_CONFIG = {
    removeOnComplete: {
        age: 3600, // 1 hour
    },
    removeOnFail: {
        age: 24 * 3600, // 1 day
    },
};

// =========================== Algorithm Job Queue ===========================
export const algorithmJobQueueName = "algorithmJobQueue";
export const algorithmJobName = "algorithmJob";

export const algorithmJobQueue = new Queue<AlgorithmJobInputData>(
    algorithmJobQueueName,
    { connection: redisOptions }
);

// Call the worker after setting up the queue
setUpAlgorithmWorker();

export const addJobToAlgorithmQueue = async (
    jobName: string,
    jobData: AlgorithmJobInputData
) => {
    return algorithmJobQueue.add(jobName, jobData, DEFAULT_REMOVE_CONFIG);
};

// =========================== Bull Board Server Adapter ===========================
export const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/bullmq");

export const bullBoard = createBullBoard({
    queues: [new BullMQAdapter(algorithmJobQueue)],
    serverAdapter: serverAdapter,
});
