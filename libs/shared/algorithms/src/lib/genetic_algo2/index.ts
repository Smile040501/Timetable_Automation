import { Class, Data, Logger } from "@ta/shared/models";
import { AlgorithmConfigData } from "@ta/shared/utils";

import GeneticAlgorithm from "./geneticAlgorithm";
import Schedule from "./schedule";

export const executeGen2 = async (configData?: AlgorithmConfigData) => {
    const VERBOSE =
        configData?.VERBOSE ?? process.env.NODE_ENV !== "production";
    let RANDOM_DATA = configData?.RANDOM_DATA ?? true;
    const UPPER_BOUND = configData?.UPPER_BOUND ?? 10000;
    const MIN_NUM_FACULTY = configData?.MIN_NUM_FACULTY ?? 5;
    const NUM_PME = configData?.NUM_PME ?? 1;
    const EXPANDED_SLOTS = configData?.EXPANDED_SLOTS ?? false;

    if (
        configData?.inputCourses?.length !== 0 ||
        configData?.inputRooms?.length !== 0 ||
        configData?.inputSlots?.length !== 0
    ) {
        RANDOM_DATA = false;
    }

    const data = new Data(
        RANDOM_DATA,
        MIN_NUM_FACULTY,
        NUM_PME,
        EXPANDED_SLOTS,
        configData?.logFunc,
        configData?.inputCourses,
        configData?.inputRooms,
        configData?.inputSlots
    );
    const logger = new Logger();

    if (VERBOSE) Logger.logVerboseData(data);

    const geneticAlgo = new GeneticAlgorithm(data);
    geneticAlgo.execute(UPPER_BOUND);

    const bestSchedule = geneticAlgo.population.schedules[0] as Schedule;
    Logger.logBestScheduleResults(bestSchedule.classes, [], data);

    return [data, logger, bestSchedule.classes] as [Data, Logger, Class[]];
};
