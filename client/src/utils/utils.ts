import Class from "../algorithms/models/class";
import Conflict from "../algorithms/models/conflict";
import Course from "../algorithms/models/course";
import Data from "../algorithms/models/data";
import Faculty from "../algorithms/models/faculty";
import Room from "../algorithms/models/room";
import Slot from "../algorithms/models/slot";
import Logger from "../algorithms/models/logger";

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
    data.logFunction(`Slots:\n ${Slot.exportAsJSON(data.slots)}`);
    data.logFunction(`Courses:\n ${Course.exportAsJSON(data.courses)}`);
    data.logFunction(`Rooms:\n ${Room.exportAsJSON(data.rooms)}`);
    data.logFunction(`Faculties:\n ${Faculty.exportAsJSON(data.faculties)}`);
};

export const logVerboseData = (data: Data, logger: Logger) => {
    exportDataAsJSON(data);

    data.logFunction("Data Object:");
    data.logFunction(data);

    data.logFunction("> All Available Data");
    const { courses, rooms, slots } = Logger.logAllData(data);
    data.logFunction(
        "======================================= COURSES ======================================="
    );
    data.logFunction(courses);
    data.logFunction(
        "======================================= ROOMS ======================================="
    );
    data.logFunction(rooms);
    data.logFunction(
        "======================================= SLOTS ======================================="
    );
    data.logFunction(slots);
};

export const logBestScheduleResults = (
    classes: Class[],
    conflicts: Conflict[],
    data: Data
) => {
    data.logFunction("Best Schedule:");
    data.logFunction(classes);
    data.logFunction(
        `Schedule WRT Classes\n ${Logger.logScheduleWRTClasses(classes)}`
    );
    data.logFunction(
        `Schedule WRT Slots\n ${Logger.logScheduleWRTSlots(classes, data)}`
    );
    data.logFunction(
        `Schedule WRT Rooms\n ${Logger.logScheduleWRTRooms(classes, data)}`
    );
    data.logFunction(
        `Schedule WRT Faculties\n ${Logger.logScheduleWRTFaculties(
            classes,
            data
        )}`
    );
    data.logFunction(
        `Conflicts\n ${Logger.logConflicts(conflicts as Conflict[])}`
    );
    data.logFunction(
        `WeekWise Schedule\n ${Logger.logWeekWiseSchedule(
            Class.getWeekdayWiseSchedule(classes)
        )}`
    );
};

export const generateRandomColor = () => {
    const hex = Math.floor(Math.random() * 0xffffff);
    const color = "#" + hex.toString(16);
    return color;
};
