import { Class, Data, Logger } from "@ta/shared/models";
import { AlgorithmConfigData } from "@ta/shared/utils";

import { executeGen1 } from "../genetic_algo1";
import SimulatedAnnealing from "./simulatedAnnealing";

export const executeSA = async (configData?: AlgorithmConfigData) => {
    const [data, logger, bestScheduleClasses] = await executeGen1(configData);

    const simulatedAlgo = new SimulatedAnnealing(bestScheduleClasses, data);
    const bestScheduleAllocation = simulatedAlgo.execute();

    Logger.logBestScheduleResults(bestScheduleAllocation, [], data);

    return [data, logger, bestScheduleAllocation] as [Data, Logger, Class[]];
};
