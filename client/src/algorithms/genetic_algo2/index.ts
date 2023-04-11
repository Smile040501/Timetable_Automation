import Data from "../models/data";
import GeneticAlgorithm from "./geneticAlgorithm";
import Logger from "../utils/logger";
import { logBestScheduleResults, logVerboseData } from "../utils/utils";
import Schedule from "./schedule";

const execute = (configData?: {
    VERBOSE?: boolean;
    RANDOM_DATA?: boolean;
    MIN_NUM_FACULTY?: number;
    NUM_PME?: number;
    EXPANDED_SLOTS?: boolean;
}) => {
    const VERBOSE =
        configData?.VERBOSE ?? process.env.NODE_ENV !== "production";
    const RANDOM_DATA = configData?.RANDOM_DATA ?? true;
    const MIN_NUM_FACULTY = configData?.MIN_NUM_FACULTY ?? 5;
    const NUM_PME = configData?.NUM_PME ?? 1;
    const EXPANDED_SLOTS = configData?.EXPANDED_SLOTS ?? false;

    const data = new Data(
        RANDOM_DATA,
        MIN_NUM_FACULTY,
        NUM_PME,
        EXPANDED_SLOTS
    );
    const logger = new Logger();

    if (VERBOSE) logVerboseData(data, logger);

    const geneticAlgo = new GeneticAlgorithm(data);
    geneticAlgo.execute();

    const bestSchedule = geneticAlgo.population.schedules[0] as Schedule;
    logBestScheduleResults(bestSchedule.classes, [], data);

    return [data, logger, geneticAlgo.population.schedules[0] as Schedule] as [
        Data,
        Logger,
        Schedule
    ];
};

export default execute;
