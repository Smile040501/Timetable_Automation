import Data from "./data";
import GeneticAlgorithm from "./geneticAlgorithm";
import Logger from "./utils/logger";

const execute = () => {
    const verbose = false;
    const data = new Data();
    const logger = new Logger(data);

    if (verbose) {
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
    }

    const geneticAlgo = new GeneticAlgorithm(data);
    if (!verbose) {
        geneticAlgo.execute();
    }

    if (verbose) {
        // console.log(logger.logGeneration(geneticAlgo.population));
        const bestSchedule = geneticAlgo.population.schedules[0];
        console.log(logger.logScheduleWRTClasses(bestSchedule));
        console.log(logger.logScheduleWRTSlots(bestSchedule));
        console.log(logger.logScheduleWRTRooms(bestSchedule));
        console.log(logger.logScheduleWRTFaculties(bestSchedule));
        console.log(logger.logConflicts(bestSchedule));
        console.log(
            logger.logWeekWiseSchedule(bestSchedule.getWeekdayWiseSchedule())
        );
    }
};

export default execute;
