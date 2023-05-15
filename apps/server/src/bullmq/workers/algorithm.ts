import { Worker } from "bullmq";
import path from "path";

import { redisOptions } from "../../utils/redisConnect";
import { AlgorithmJobInputData } from "../interface";
import { algorithmJobQueueName } from "../bullmq";

// Should be a .js file which will be generated in the final `dist` folder
const algorithmProcessorPath = path.join(__dirname, "algorithm.js");

export const setUpAlgorithmWorker = () => {
    const algorithmWorker = new Worker<AlgorithmJobInputData>(
        algorithmJobQueueName,
        algorithmProcessorPath,
        { connection: redisOptions, autorun: true }
    );

    console.log(`Algorithm Worker Started!`);

    algorithmWorker.on("completed", async (job) => {
        console.debug(`Completed job ${job.name} with id ${job.id}!`);
    });

    algorithmWorker.on("active", (job) => {
        console.debug(`Completed job ${job.name} with id ${job.id}!`);
    });

    algorithmWorker.on("failed", (job, err) => {
        console.error(`Job ${job?.name} with ID ${job?.id} failed!`);
        console.error(`Job ${job?.name} encountered an error:`, err);
    });
};
