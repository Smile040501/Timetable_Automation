import { table } from "table";

import { getEnumKeys, ConflictType, WeekDay } from "@ta/shared/utils";

import { Class } from "./class";
import { Conflict } from "./conflict";
import { Course } from "./course";
import { Data } from "./data";
import { Faculty } from "./faculty";
import { Interval } from "./interval";
import { Population } from "./population";
import { Room } from "./room";
import { Slot } from "./slot";

export class Logger {
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
                cls.rooms
                    .map((room) => `(${room.name}, ${room.campus})`)
                    .join("\n"),
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
                        cls.rooms[cls.slots.indexOf(slot)].name
                    },[${cls.course.faculties.join(",")}]>`
            );
            sch.push([slot.toString(false), Logger.getCSVString(classStr, 4)]);
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
                    },${cls.rooms
                        .map((room) => room.name)
                        .join(",")},[${cls.slots
                        .map((slot) => slot.name)
                        .join(",")}]>`
            );
            sch.push([faculty.toString(), Logger.getCSVString(classStr, 4)]);
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
        separator = ", ",
        gapSeparator = "\n"
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

    static exportDataAsJSON = (data: Data) => {
        data.logFunction(`Slots:\n ${Slot.exportAsJSON(data.slots)}`);
        data.logFunction(`Courses:\n ${Course.exportAsJSON(data.courses)}`);
        data.logFunction(`Rooms:\n ${Room.exportAsJSON(data.rooms)}`);
        data.logFunction(
            `Faculties:\n ${Faculty.exportAsJSON(data.faculties)}`
        );
    };

    static logVerboseData = (data: Data) => {
        Logger.exportDataAsJSON(data);

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

    static logBestScheduleResults = (
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
}
