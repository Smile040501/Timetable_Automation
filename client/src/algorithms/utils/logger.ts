import { table } from "table";

import Class from "../models/class";
import Conflict from "../models/conflict";
import Data from "../models/data";
import Slot from "../models/slot";
import Population from "../models/population";
import { ConflictType, WeekDay } from "./enums";
import Interval from "./interval";
import { getEnumKeys } from "./utils";

export default class Logger {
    static logAllData = (data: Data) => {
        return {
            courses: Logger.logCourses(data),
            rooms: Logger.logRooms(data),
            slots: Logger.logSlots(data),
        };
    };

    static logCourses = (data: Data) => {
        const courses: string[][] = [
            [
                "Code",
                "Course",
                "Department",
                "Credits",
                "Course Type",
                "Lecture Type",
                "Max # of Students",
                "Faculties",
            ],
        ];
        for (const course of data.courses) {
            courses.push([
                course.code,
                course.name,
                course.department,
                course.totalCredits.toString(),
                course.courseType,
                course.lectureType,
                course.maxNumberOfStudents.toString(),
                Logger.getCSVString(
                    course.faculties.map((f) => f.toString()),
                    1
                ),
            ]);
        }
        return table(courses);
    };

    static logRooms = (data: Data) => {
        const rooms: string[][] = [
            ["Room #", "Campus", "Capacity", "LectureType"],
        ];
        for (const room of data.rooms) {
            rooms.push([
                room.name,
                room.campus,
                room.capacity.toString(),
                room.lectureType,
            ]);
        }
        return table(rooms);
    };

    static logSlots = (data: Data) => {
        const slots: string[][] = [
            ["Slot", "Credits", "LectureType", "Timings"],
        ];
        for (const slot of data.slots) {
            const meetings = [];
            for (const meetingTime of slot.dayTime) {
                meetings.push(
                    `[${meetingTime[0]}, ${meetingTime[1].toString()}]`
                );
            }
            slots.push([
                slot.name,
                slot.credits.toString(),
                slot.lectureType,
                meetings.join(", "),
            ]);
        }
        return table(slots);
    };

    static logGeneration = (population: Population) => {
        const generation: string[][] = [
            [
                "Schedule Id",
                "Fitness",
                "# of Allocated Classes",
                "Classes [Course,Room,Slot]",
            ],
        ];
        population.schedules.forEach((sch, i) => {
            const classes = Logger.getCSVString(
                sch.classes.map((cls) => cls.toString()),
                1
            );
            generation.push([
                i.toString(),
                sch.fitness.toFixed(3).toString(),
                sch.classes.length.toString(),
                classes,
            ]);
        });
        return table(generation);
    };

    static logScheduleWRTClasses = (classes: Class[]) => {
        const sch: string[][] = [
            [
                "Class #",
                "Course (Department, Lecture Type, Credits) (Max # of Students) [Faculties]",
                "Room (Campus, Lecture Type, Capacity)",
                "Slot (Name, Day, Credits)",
            ],
        ];
        for (const cls of classes) {
            sch.push([
                `CLS${cls.id}`,
                cls.course.toString(),
                cls.room ? cls.room.toString() : "",
                cls.slots
                    .map((slot) => `(${slot.name}, ${slot.credits})`)
                    .join("\n"),
            ]);
        }
        return table(sch);
    };

    static logScheduleWRTSlots = (classes: Class[], data: Data) => {
        const slotMapping = Class.getSlotToClassMapping(classes, data);
        const sch: string[][] = [
            [
                "Slot (Lecture Type, Credits)",
                "Classes (Course, Department, Room, Faculties)",
            ],
        ];
        slotMapping.forEach((classes, slot) => {
            const classStr = classes.map(
                (cls) =>
                    `<${cls.course.code},${cls.course.department},${
                        cls.room ? cls.room.name : ""
                    },[${cls.course.faculties.join(",")}]>`
            );
            sch.push([slot!.toString(false), Logger.getCSVString(classStr, 4)]);
        });
        return table(sch);
    };

    static logScheduleWRTRooms = (classes: Class[], data: Data) => {
        const roomMapping = Class.getRoomToClassMapping(classes, data);
        const sch: string[][] = [
            [
                "Room (Name, Campus, Lecture Type, Capacity)",
                "Classes (Course, Department, Max # of Students, Faculties, Slots)",
            ],
        ];
        roomMapping.forEach((classes, room) => {
            const classStr = classes.map(
                (cls) =>
                    `<${cls.course.code},${cls.course.department},${
                        cls.course.maxNumberOfStudents
                    },[${cls.course.faculties.join(",")}][${cls.slots
                        .map((slot) => slot.name)
                        .join(",")}]>`
            );
            sch.push([
                room ? room.toString() : "",
                Logger.getCSVString(classStr, 4),
            ]);
        });
        return table(sch);
    };

    static logScheduleWRTFaculties = (classes: Class[], data: Data) => {
        const facultyMapping = Class.getFacultyToClassMapping(classes, data);
        const sch: string[][] = [
            [
                "Faculty",
                "Classes (Course, Department, Max # of Students, Room, Slots)",
            ],
        ];
        facultyMapping.forEach((classes, faculty) => {
            const classStr = classes.map(
                (cls) =>
                    `<${cls.course.code},${cls.course.department},${
                        cls.course.maxNumberOfStudents
                    },${cls.room ? cls.room.name : ""},[${cls.slots
                        .map((slot) => slot.name)
                        .join(",")}]>`
            );
            sch.push([faculty!.toString(), Logger.getCSVString(classStr, 4)]);
        });
        return table(sch);
    };

    static logConflicts = (conflicts: Conflict[]) => {
        const conflictsStr: string[][] = [
            ["Conflict Type", "Classes", "Other Info"],
        ];
        for (const conflict of conflicts) {
            conflictsStr.push([
                ConflictType[conflict.conflictType],
                conflict.conflictingClasses
                    .map((cls) => cls.toString())
                    .join(", "),
                conflict.otherInfo.toString(),
            ]);
        }
        return table(conflictsStr);
    };

    static logWeekWiseSchedule = (
        p: [Map<number, [Class, Interval, Slot][]>[], Interval[]]
    ) => {
        const [schedule, intervalsSet] = p;
        const header = ["WeekDay"];
        intervalsSet.forEach((interval) => {
            header.push(interval.toString());
        });
        const sch: string[][] = [];
        const weekDays = getEnumKeys(WeekDay);
        weekDays.forEach((weekDay, weekIdx) => {
            sch.push([weekDay]);
            schedule[weekIdx].forEach((cis) => {
                sch[weekIdx].push(
                    cis
                        .map((ci) => {
                            const [cls, , slot] = ci;
                            return `${cls.course.code},${slot.name}`;
                        })
                        .join("\n")
                );
            });
        });
        sch.unshift(header);
        return table(sch);
    };

    static getCSVString = (
        arr: string[],
        gap: number,
        separator: string = ", ",
        gapSeparator: string = "\n"
    ) => {
        const strArr: string[] = [];
        arr.forEach((str, i) => {
            strArr.push(str);
            if (i !== arr.length - 1) {
                strArr.push(separator);
                if ((i + 1) % gap === 0) {
                    strArr.push(gapSeparator);
                }
            }
        });
        return strArr.join("");
    };
}
