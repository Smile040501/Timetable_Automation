import Data from "../models/data";
import GeneticAlgorithm from "./geneticAlgorithm";
import Logger from "../utils/logger";
import { logBestScheduleResults, logVerboseData } from "../utils/utils";

const execute = () => {
    const RANDOM_DATA = false;
    const VERBOSE = process.env.NODE_ENV !== "production";

    const data = new Data(RANDOM_DATA);
    const logger = new Logger();

    if (VERBOSE) logVerboseData(data, logger);

    const geneticAlgo = new GeneticAlgorithm(data);
    geneticAlgo.execute();

    logBestScheduleResults(geneticAlgo.population, data);
};

export default execute;
