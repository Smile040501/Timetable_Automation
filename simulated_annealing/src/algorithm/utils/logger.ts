import { getEnumKeys } from "./utils";
import { table } from "table";
import Class from "../class";

import Data from "../data";
import Population from "../population";
import Schedule from "../schedule";
import { ConflictType, WeekDay } from "./enums";
import Interval from "./interval";
import Slot from "../models/slot";

export default class Logger {
    constructor(public data: Data) {}

    getCSVString = (
        arr: string[],
        gap: number,
        separator: string = ",",
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

    logAllData = () => {
        return {
            courses: this.logCourses(),
            rooms: this.logRooms(),
            slots: this.logSlots(),
        };
    };

    logCourses = () => {
        const courses: string[][] = [
            [
                "Course",
                "Department",
                "Credits",
                "Course Type",
                "Lecture Type",
                "Max # of Students",
                "Faculties",
            ],
        ];
        for (const course of this.data.courses) {
            courses.push([
                course.name,
                course.department,
                course.totalCredits.toString(),
                course.courseType,
                course.lectureType,
                course.maxNumberOfStudents.toString(),
                course.faculties.map((f) => f.toString()).join(", "),
            ]);
        }
        return table(courses);
    };

    logRooms = () => {
        const rooms: string[][] = [
            ["Room #", "Campus", "Capacity", "LectureType"],
        ];
        for (const room of this.data.rooms) {
            rooms.push([
                room.name,
                room.campus,
                room.capacity.toString(),
                room.lectureType,
            ]);
        }
        return table(rooms);
    };

    logSlots = () => {
        const slots: string[][] = [
            ["Slot", "Credits", "LectureType", "Timings"],
        ];
        for (const slot of this.data.slots) {
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

    logGeneration = (population: Population) => {
        const generation: string[][] = [
            [
                "Schedule Id",
                "Fitness",
                "# of Conflicts",
                "Classes [Course,Room,Slot]",
            ],
        ];
        population.schedules.forEach((sch, i) => {
            const classes = this.getCSVString(
                sch.classes.map((cls) => cls.toString()),
                1,
                ", "
            );
            generation.push([
                i.toString(),
                sch.fitness.toFixed(3).toString(),
                sch.conflicts.length.toString(),
                classes,
            ]);
        });
        return table(generation);
    };

    logScheduleWRTClasses = (schedule: Schedule) => {
        const sch: string[][] = [
            [
                "Class #",
                "Course (Department, Lecture Type, Credits) (Max # of Students) [Faculties]",
                "Room (Campus, Lecture Type, Capacity)",
                "Slot (Name, Day, Credits)",
            ],
        ];
        for (const cls of schedule.classes) {
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

    logScheduleWRTSlots = (schedule: Schedule) => {
        const slotMapping = schedule.getSlotToClassMapping();
        const sch: string[][] = [
            [
                "Slot (Lecture Type, Credits)",
                "Classes (Course, Department, Room, Faculties)",
            ],
        ];
        slotMapping.forEach((classes, slot) => {
            const classStr = classes.map(
                (cls) =>
                    `<${cls.course.name},${cls.course.department},${
                        cls.room ? cls.room.name : ""
                    },[${cls.course.faculties.join(",")}]>`
            );
            sch.push([
                slot!.toString(false),
                this.getCSVString(classStr, 4, ", "),
            ]);
        });
        return table(sch);
    };

    logScheduleWRTRooms = (schedule: Schedule) => {
        const roomMapping = schedule.getRoomToClassMapping();
        const sch: string[][] = [
            [
                "Room (Name, Campus, Lecture Type, Capacity)",
                "Classes (Course, Department, Max # of Students, Faculties, Slots)",
            ],
        ];
        roomMapping.forEach((classes, room) => {
            const classStr = classes.map(
                (cls) =>
                    `<${cls.course.name},${cls.course.department},${
                        cls.course.maxNumberOfStudents
                    },[${cls.course.faculties.join(",")}][${cls.slots
                        .map((slot) => slot.name)
                        .join(",")}]>`
            );
            sch.push([
                room ? room.toString() : "",
                this.getCSVString(classStr, 4, ", "),
            ]);
        });
        return table(sch);
    };

    logScheduleWRTFaculties = (schedule: Schedule) => {
        const facultyMapping = schedule.getFacultyToClassMapping();
        const sch: string[][] = [
            [
                "Faculty",
                "Classes (Course, Department, Max # of Students, Room, Slots)",
            ],
        ];
        facultyMapping.forEach((classes, faculty) => {
            const classStr = classes.map(
                (cls) =>
                    `<${cls.course.name},${cls.course.department},${
                        cls.course.maxNumberOfStudents
                    },${cls.room ? cls.room.name : ""},[${cls.slots
                        .map((slot) => slot.name)
                        .join(",")}]>`
            );
            sch.push([
                faculty!.toString(),
                this.getCSVString(classStr, 4, ", "),
            ]);
        });
        return table(sch);
    };

    logConflicts = (schedule: Schedule) => {
        const conflicts: string[][] = [
            ["Conflict Type", "Classes", "Other Info"],
        ];
        for (const conflict of schedule.conflicts) {
            conflicts.push([
                ConflictType[conflict.conflictType],
                conflict.conflictingClasses
                    .map((cls) => cls.toString())
                    .join(", "),
                conflict.otherInfo.toString(),
            ]);
        }
        return table(conflicts);
    };

    logWeekWiseSchedule = (
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
                            return `${cls.course.name},${slot.name}`;
                        })
                        .join("\n")
                );
            });
        });
        sch.unshift(header);
        return table(sch);
    };
}
