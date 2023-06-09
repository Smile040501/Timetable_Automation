import { Class, Data, Logger } from "@ta/shared/models";
import { AlgorithmConfigData } from "@ta/shared/utils";

import GeneticAlgorithm from "./geneticAlgorithm";
import Schedule from "./schedule";

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

export const executeGen1 = async (configData?: AlgorithmConfigData) => {
    const GENERATE_PLOT_DATA = false;
    const NUM_PLOT_POINTS = 10;

    const VERBOSE =
        configData?.VERBOSE ?? process.env.NODE_ENV !== "production";
    let RANDOM_DATA = configData?.RANDOM_DATA ?? true;
    const UPPER_BOUND = configData?.UPPER_BOUND ?? 10000;
    const MIN_NUM_FACULTY = configData?.MIN_NUM_FACULTY ?? 2;
    const NUM_PME = configData?.NUM_PME ?? 1;
    const EXPANDED_SLOTS = configData?.EXPANDED_SLOTS ?? false;

    if (GENERATE_PLOT_DATA) {
        generatePlotData(
            NUM_PLOT_POINTS,
            RANDOM_DATA,
            MIN_NUM_FACULTY,
            UPPER_BOUND
        );
    }

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
    Logger.logBestScheduleResults(
        bestSchedule.classes,
        bestSchedule.conflicts,
        data
    );

    return [data, logger, bestSchedule.classes] as [Data, Logger, Class[]];
};
