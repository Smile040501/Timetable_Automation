/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Job } from "bullmq";

import { AlgorithmStatus } from "@ta/shared/utils";
import { algorithmOptions } from "@ta/shared/algorithms";

import { connectDB } from "../../config";
import { saveAlgorithmResults } from "../../controllers/algorithm";
import { AlgorithmJobInputData } from "../interface";
import { setRedisAlgorithmStatus } from "../../utils/algorithmStatus";

export default async function algorithmJobProcessor(
    job: Job<AlgorithmJobInputData>
) {
    try {
        await job.log(`Started processing job ${job.name} with id ${job.id}!`);
        console.log(`Started processing job ${job.name} with id ${job.id}!`);

        const { algorithmConfig, algorithmId, courses, rooms, slots } =
            job.data;

        // Do  CPU intense logic here
        const algorithmOption = algorithmOptions.find(
            (algo) => algo.id === algorithmId
        )!;

        const algorithmResult = await algorithmOption.algorithm(
            algorithmConfig
        );

        // Need to connect to mongodb again as it is running on a separate thread
        const db = await connectDB();

        await saveAlgorithmResults({
            algorithmResult,
            courses,
            rooms,
            slots,
        });

        if (db) {
            db.disconnect();
        }

        await job.updateProgress(100);
    } catch (err) {
        console.log(err);
        await setRedisAlgorithmStatus(AlgorithmStatus.FAILED);
    }
}
