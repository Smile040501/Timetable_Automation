import Data from "./data";
import GeneticAlgorithm from "./geneticAlgorithm";
import SimulatedAnnealing from "./simulatedAnnealing";
import Logger from "./utils/logger";

const execute = () => {
    const generatePlotData = false;
    if (generatePlotData) {
        const upperBound = 10000;
        const result: [number, number, number][] = [];
        for (let i = 0; i <= 10; ++i) {
            const data = new Data(Math.max(i, 2), i);
            const geneticAlgo = new GeneticAlgorithm(data);
            const [numGenerations, fitness] = geneticAlgo.execute(upperBound);
            result.push([data.courses.length, numGenerations, fitness]);
        }
        console.log(result);

        /* Results
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
        return;
    }

    const verbose = false;
    if (verbose) {
        const data = new Data(2, 1);
        const logger = new Logger(data);
        console.log(data);
        console.log("> All Available Data");
        const { courses, rooms, slots } = logger.logAllData();
        console.log(
            "======================================= COURSES ======================================="
        );
        console.log(courses);
        console.log(
            "======================================= ROOMS ======================================="
        );
        console.log(rooms);
        console.log(
            "======================================= SLOTS ======================================="
        );
        console.log(slots);
        return;
    }

    const data = new Data(15, 5);
    const logger = new Logger(data);
    const geneticAlgo = new GeneticAlgorithm(data);

    geneticAlgo.execute(10000);
    const simulatedAlgo = new SimulatedAnnealing(
        geneticAlgo.population.schedules[0].classes,
        data
    );

    console.log(simulatedAlgo.execute());

    const bestSchedule = geneticAlgo.population.schedules[0];
    console.log(logger.logScheduleWRTClasses(bestSchedule));
    console.log(logger.logScheduleWRTSlots(bestSchedule));
    console.log(logger.logScheduleWRTRooms(bestSchedule));
    console.log(logger.logScheduleWRTFaculties(bestSchedule));
    console.log(logger.logConflicts(bestSchedule));
    console.log(
        logger.logWeekWiseSchedule(bestSchedule.getWeekdayWiseSchedule())
    );
};

export default execute;
