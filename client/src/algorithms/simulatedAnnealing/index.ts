import executeRandomGeneticAlgo from "../genetic_algo1";
import { logBestScheduleResults } from "../utils/utils";
import SimulatedAnnealing from "./simulatedAnnealing";

const execute = () => {
    const VERBOSE = process.env.NODE_ENV !== "production";
    const RANDOM_DATA = false;
    const UPPER_BOUND = 2000;
    const MIN_NUM_FACULTY = 2;
    const NUM_PME = 1;

    const [data, , bestSchedule] = executeRandomGeneticAlgo({
        VERBOSE,
        RANDOM_DATA,
        UPPER_BOUND,
        MIN_NUM_FACULTY,
        NUM_PME,
    });

    const simulatedAlgo = new SimulatedAnnealing(bestSchedule.classes, data);
    const bestScheduleAllocation = simulatedAlgo.execute();

    logBestScheduleResults(bestScheduleAllocation, [], data);
};

export default execute;
