import executeRandomGeneticAlgo from "../genetic_algo1";
import { logBestScheduleResults } from "../utils/utils";
import SimulatedAnnealing from "./simulatedAnnealing";

const execute = () => {
    const VERBOSE = process.env.NODE_ENV !== "production";
    const RANDOM_DATA = true;
    const UPPER_BOUND = 100;
    const MIN_NUM_FACULTY = 2;
    const NUM_PME = 1;
    const EXPANDED_SLOTS = true;

    const [data, , bestSchedule] = executeRandomGeneticAlgo({
        VERBOSE,
        RANDOM_DATA,
        UPPER_BOUND,
        MIN_NUM_FACULTY,
        NUM_PME,
        EXPANDED_SLOTS,
    });

    // const simulatedAlgo = new SimulatedAnnealing(bestSchedule.classes, data);
    // const bestScheduleAllocation = simulatedAlgo.execute();
    let simulatedAlgo = new SimulatedAnnealing(null, data);
    simulatedAlgo.timetable = simulatedAlgo.makeTimetableGreedily(
        simulatedAlgo.timetable
    );
    simulatedAlgo.checkTimetable(simulatedAlgo.timetable);

    // logBestScheduleResults(bestScheduleAllocation, [], data);
};

export default execute;
