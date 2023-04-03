import Data from "../models/data";
import GeneticAlgorithm from "./geneticAlgorithm";
import Logger from "../utils/logger";
import { logBestScheduleResults, logVerboseData } from "../utils/utils";
import Schedule from "./schedule";

const execute = (configData?: { VERBOSE?: boolean; RANDOM_DATA?: boolean }) => {
    const VERBOSE =
        configData?.VERBOSE ?? process.env.NODE_ENV !== "production";
    const RANDOM_DATA = configData?.RANDOM_DATA ?? true;

    const data = new Data(RANDOM_DATA);
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
