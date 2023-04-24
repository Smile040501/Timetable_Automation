import Class from "../models/class";
import Conflict from "../models/conflict";
import Course from "../models/course";
import Data from "../models/data";
import Faculty from "../models/faculty";
import Room from "../models/room";
import Slot from "../models/slot";
import Logger from "./logger";

export const getRandomEnumKey = (enumeration: any) => {
    const keys = Object.keys(enumeration).filter(
        (k) => !(Math.abs(Number.parseInt(k)) + 1)
    );
    const enumKey = keys[Math.floor(Math.random() * keys.length)];
    return enumKey;
};

export const getRandomEnumValue = (enumeration: any) =>
    enumeration[getRandomEnumKey(enumeration)];

export const getEnumKeys = (enumeration: any) =>
    Object.keys(enumeration).filter((k) => !(Math.abs(Number.parseInt(k)) + 1));

export const getBiasedArray = (arr: any[], p: number[]) => {
    const biasedArray: any[] = [];
    arr.forEach((el, i) => {
        for (let j = 0; j < p[i]; ++j) {
            biasedArray.push(el);
        }
    });
    return biasedArray;
};

export const expandObject = (obj: { [prop: string]: any }) => {
    Object.keys(obj).forEach((key) => {
        const subKeys = key.split(/,\s?/);
        const target = obj[key];
        delete obj[key];
        subKeys.forEach((subKey) => (obj[subKey] = target));
    });
    return obj;
};

export const exportDataAsJSON = (data: Data) => {
    console.log("Slots:\n", Slot.exportAsJSON(data.slots));
    console.log("Courses:\n", Course.exportAsJSON(data.courses));
    console.log("Rooms:\n", Room.exportAsJSON(data.rooms));
    console.log("Faculties:\n", Faculty.exportAsJSON(data.faculties));
};

export const logVerboseData = (data: Data, logger: Logger) => {
    exportDataAsJSON(data);

    console.log("Data Object:", data);

    console.log("> All Available Data");
    const { courses, rooms, slots } = Logger.logAllData(data);
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
};

export const logBestScheduleResults = (
    classes: Class[],
    conflicts: Conflict[],
    data: Data
) => {
    console.log("Best Schedule:", classes);
    console.log(
        "Schedule WRT Classes\n",
        Logger.logScheduleWRTClasses(classes)
    );
    console.log(
        "Schedule WRT Slots\n",
        Logger.logScheduleWRTSlots(classes, data)
    );
    console.log(
        "Schedule WRT Rooms\n",
        Logger.logScheduleWRTRooms(classes, data)
    );
    console.log(
        "Schedule WRT Faculties\n",
        Logger.logScheduleWRTFaculties(classes, data)
    );
    console.log("Conflicts\n", Logger.logConflicts(conflicts as Conflict[]));
    console.log(
        "WeekWise Schedule\n",
        Logger.logWeekWiseSchedule(Class.getWeekdayWiseSchedule(classes))
    );
};