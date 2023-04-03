import Data from "../models/data";
import GeneticAlgorithm from "./geneticAlgorithm";
import Logger from "../utils/logger";
import { logBestScheduleResults, logVerboseData } from "../utils/utils";

const generatePlotData = (
    numPlotPoints: number,
    random: boolean,
    minNumFaculty: number,
    upperBound: number
) => {
    const result: [number, number, number][] = [];
    for (let i = 0; i <= numPlotPoints; ++i) {
        const data = new Data(random, Math.max(i, minNumFaculty), i);
        const geneticAlgo = new GeneticAlgorithm(data);
        const [numGenerations, bestSchedule] = geneticAlgo.execute(upperBound);
        result.push([
            data.courses.length,
            numGenerations,
            bestSchedule.fitness,
        ]);
    }
    console.log(result);

    /* Results for 10K generations for 10 points with random data and min 2 faculties
        [37, 235, 1],
        [41, 3475, 1],
        [45, 10000, 0.07916666666666666],
        [49, 10000, 0.000576923076923077],
        [53, 10000, 0.059375],
        [57, 10000, 0.03958333333333333],
        [61, 10000, 0.00032386363636363635],
        [65, 10000, 0.000038306451612903224],
        [69, 10000, 0.00004656862745098038],
        [73, 10000, 0.000095],
        [77, 10000, 0.00006850961538461538],
    */
};

const execute = () => {
    const RANDOM_DATA = true;
    const GENERATE_PLOT_DATA = false;
    const VERBOSE = process.env.NODE_ENV !== "production";
    const NUM_PLOT_POINTS = 10;
    const UPPER_BOUND = 10000;
    const MIN_NUM_FACULTY = 2;
    const NUM_PME = 1;

    if (GENERATE_PLOT_DATA) {
        return generatePlotData(
            NUM_PLOT_POINTS,
            RANDOM_DATA,
            MIN_NUM_FACULTY,
            UPPER_BOUND
        );
    }

    const data = new Data(RANDOM_DATA, MIN_NUM_FACULTY, NUM_PME);
    const logger = new Logger();

    if (VERBOSE) logVerboseData(data, logger);

    const geneticAlgo = new GeneticAlgorithm(data);
    geneticAlgo.execute(UPPER_BOUND);

    logBestScheduleResults(geneticAlgo.population, data);
};

export default execute;
