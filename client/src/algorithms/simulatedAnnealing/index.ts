import Class from "../models/class";
import Data from "../models/data";
import executeRandomGeneticAlgo from "../genetic_algo1";
import { logBestScheduleResults } from "../utils/utils";
import SimulatedAnnealing from "./simulatedAnnealing";
import Logger from "../utils/logger";
import { AlgorithmConfigData } from "../../utils/interfaces";

const execute = async (configData?: AlgorithmConfigData) => {
    const [data, logger, bestScheduleClasses] = await executeRandomGeneticAlgo(
        configData
    );

    const simulatedAlgo = new SimulatedAnnealing(bestScheduleClasses, data);
    const bestScheduleAllocation = simulatedAlgo.execute();

    logBestScheduleResults(bestScheduleAllocation, [], data);

    return [data, logger, bestScheduleAllocation] as [Data, Logger, Class[]];
};

export default execute;
