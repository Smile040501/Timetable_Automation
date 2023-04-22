import intersection from "lodash/intersection";

import Course from "./course";
import Conflict from "./conflict";
import Data from "./data";
import Faculty from "./faculty";
import Room from "./room";
import Slot from "./slot";
import {
    ConflictType,
    CourseType,
    Departments,
    LectureType,
    WeekDay,
} from "../../utils/enums";
import Interval from "./interval";
import { getEnumKeys } from "../../utils/utils";

// Gene for a Chromosome
export default class Class {
    constructor(
        public id: number,
        public course: Course,
        public slots: Slot[] = [],
        public room?: Room
    ) {}

    toString = () => {
        return `<${this.course.code},${
            this.room ? this.room.name : ""
        },[${this.slots.map((slot) => slot.name).join(",")}]>`;
    };

    // If two classes overlap as per their allotted slots
    static isOverlapping = (cls1: Class, cls2: Class) => {
        let ans = false;
        cls1.slots.forEach((s1) => {
            cls2.slots.forEach((s2) => {
                if (Slot.isOverlapping(s1, s2)) {
                    ans = true;
                }
            });
        });
        return ans;
    };

    // Only give those rooms to classes with enough capacity and satisfied feature
    // For lab course, only a lab room
    // For normal course, both lab and normal room are fine
    static getEligibleRooms = (cls: Class, data: Data) => {
        return data.rooms.filter((room) => {
            if (room.capacity < cls.course.maxNumberOfStudents) {
                return false;
            }
            if (cls.course.lectureType === LectureType.Lab) {
                return room.lectureType === cls.course.lectureType;
            }
            return true;
        });
    };

    // If a class is present in a given list of classes
    static isClassPresent = (cls: Class, classes: Class[]) => {
        return (
            classes.findIndex(
                (cls2) => cls.course.code === cls2.course.code
            ) !== -1
        );
    };

    // Try for each pair of slot combination and eligible room
    static allocateSlot = (
        cls: Class,
        allocatedClasses: Class[],
        data: Data
    ) => {
        // If it is already allocated
        if (Class.isClassPresent(cls, allocatedClasses)) {
            return true;
        }

        const lectureType = cls.course.lectureType;
        const totalCredits = cls.course.totalCredits;
        const slotCombinations = data.possibleSlotCombinations
            .get(totalCredits)!
            .get(lectureType)!;
        const eligibleRooms = Class.getEligibleRooms(cls, data);

        let isAllocated = false;
        for (const slots of slotCombinations) {
            if (isAllocated) {
                break;
            }

            cls.slots = slots;
            for (const room of eligibleRooms) {
                if (isAllocated) {
                    break;
                }

                cls.room = room;
                const conflicts = Class.hasConflicts(
                    cls,
                    allocatedClasses,
                    data
                );
                if (conflicts.length === 0) {
                    allocatedClasses.push(cls);
                    isAllocated = true;
                }
            }
        }
        return isAllocated;
    };

    static hasConflicts = (cls: Class, classes: Class[], data: Data) => {
        const conflicts: Conflict[] = [];
        if (!cls.course.needsSlot) {
            return conflicts;
        }

        // Room Capacity Conflict
        conflicts.push(...Class.hasRoomCapacityConflict(cls));

        // Room Feature Conflict
        conflicts.push(...Class.hasRoomFeatureConflict(cls));

        // Instructor Booking Conflict
        conflicts.push(...Class.hasInstructorBookingConflict(cls, classes));

        // Student Booking Conflict
        conflicts.push(...Class.hasStudentBookingConflict(cls, classes, data));

        // Room Booking Conflict
        conflicts.push(...Class.hasRoomBookingConflict(cls, classes));

        const [weekWiseSchedule] = Class.getWeekdayWiseSchedule([
            cls,
            ...classes,
        ]);

        // Faculty Travel Conflict
        conflicts.push(...Class.hasFacultyTravelConflicts(weekWiseSchedule));

        // Student Travel Conflict
        conflicts.push(
            ...Class.hasStudentTravelConflicts(weekWiseSchedule, data)
        );

        return conflicts;
    };

    static hasRoomCapacityConflict = (cls: Class) => {
        if (
            cls.course.needsSlot &&
            cls.room!.capacity < cls.course.maxNumberOfStudents
        ) {
            return [new Conflict(ConflictType.RoomCapacity, [cls])];
        }
        return [];
    };

    static hasRoomFeatureConflict = (cls: Class) => {
        if (
            cls.course.needsSlot &&
            cls.course.lectureType === LectureType.Lab &&
            cls.room!.lectureType !== LectureType.Lab
        ) {
            return [new Conflict(ConflictType.RoomFeature, [cls])];
        }
        return [];
    };

    static hasInstructorBookingConflict = (cls: Class, classes: Class[]) => {
        const conflicts: Conflict[] = [];
        for (const cls2 of classes) {
            // If Classes overlap
            if (
                cls.id !== cls2.id &&
                cls.course.needsSlot &&
                cls2.course.needsSlot &&
                Class.isOverlapping(cls, cls2) &&
                // Instructor Booking Conflict
                intersection(cls.course.faculties, cls2.course.faculties)
                    .length !== 0
            ) {
                conflicts.push(
                    new Conflict(ConflictType.InstructorBooking, [cls, cls2])
                );
            }
        }
        return conflicts;
    };

    static hasStudentBookingConflict = (
        cls: Class,
        classes: Class[],
        data: Data
    ) => {
        const conflicts: Conflict[] = [];
        for (const cls2 of classes) {
            // If Classes overlap
            if (
                cls.id !== cls2.id &&
                cls.course.needsSlot &&
                cls2.course.needsSlot &&
                Class.isOverlapping(cls, cls2) &&
                // Student Booking Conflict
                cls.course.department === cls2.course.department &&
                // Classes are from department with conflicts
                data.departmentsWithConflicts.indexOf(cls.course.department) !==
                    -1
            ) {
                // Don't allow any other course from same department with PMT and PMP courses
                if (
                    cls.course.department === Departments.GENERAL ||
                    cls.course.courseType === CourseType.PMT ||
                    cls.course.courseType === CourseType.PMP ||
                    cls2.course.courseType === CourseType.PMT ||
                    cls2.course.courseType === CourseType.PMP
                ) {
                    conflicts.push(
                        new Conflict(ConflictType.StudentBooking, [cls, cls2])
                    );
                }
            }
        }
        return conflicts;
    };

    static hasRoomBookingConflict = (cls: Class, classes: Class[]) => {
        const conflicts: Conflict[] = [];
        for (const cls2 of classes) {
            // If Classes overlap
            if (
                cls.id !== cls2.id &&
                cls.course.needsSlot &&
                cls2.course.needsSlot &&
                Class.isOverlapping(cls, cls2) &&
                // Room Booking Conflict
                cls.room === cls2.room
            ) {
                conflicts.push(
                    new Conflict(ConflictType.RoomBooking, [cls, cls2])
                );
            }
        }
        return conflicts;
    };

    static hasFacultyTravelConflicts = (
        weekWiseSchedule: Map<number, [Class, Interval, Slot][]>[]
    ) => {
        let facultyTravel = 0,
            hasConflicts = false;
        for (const map of weekWiseSchedule) {
            const sch = [...map.entries()];
            let previousClasses: Class[] = [];
            let previousInterval: Interval = new Interval("08:00", "08:50");
            for (let i = 0; i < sch.length; ++i) {
                const classes = sch[i][1].map((cis) => cis[0]);
                if (classes.length === 0) {
                    continue;
                }
                const interval = sch[i][1][0][1];

                // Initial
                if (previousClasses.length === 0) {
                    previousClasses = classes;
                    previousInterval = interval;
                    continue;
                }

                const gap = Interval.getGap(previousInterval, interval);
                let haveCommonFaculty = false;

                for (const cls1 of previousClasses) {
                    for (const cls2 of classes) {
                        // Both require slots
                        if (
                            cls1.course.needsSlot &&
                            cls2.course.needsSlot &&
                            // Both have different campus
                            cls1.room!.campus !== cls2.room!.campus &&
                            // Both have common faculties
                            intersection(
                                cls1.course.faculties,
                                cls2.course.faculties
                            ).length !== 0
                        ) {
                            haveCommonFaculty = true;
                            ++facultyTravel;
                        }
                    }
                }

                previousClasses = classes;
                previousInterval = interval;

                // At least 1 hour for faculty
                if (gap < 60 && haveCommonFaculty) {
                    hasConflicts = true;
                }
            }

            if (facultyTravel > 1) {
                hasConflicts = true;
            }
        }
        return hasConflicts
            ? [new Conflict(ConflictType.FacultyTravel, [], facultyTravel)]
            : [];
    };

    static hasStudentTravelConflicts = (
        weekWiseSchedule: Map<number, [Class, Interval, Slot][]>[],
        data: Data
    ) => {
        let studentTravel = 0,
            hasConflicts = false;
        for (const map of weekWiseSchedule) {
            const sch = [...map.entries()];
            let previousClasses: Class[] = [];
            let previousInterval: Interval = new Interval();
            for (let i = 0; i < sch.length; ++i) {
                const classes = sch[i][1].map((cis) => cis[0]);
                if (classes.length === 0) {
                    continue;
                }
                const interval = sch[i][1][0][1];

                // Initial
                if (previousClasses.length === 0) {
                    previousClasses = classes;
                    previousInterval = interval;
                    continue;
                }

                const gap = Interval.getGap(previousInterval, interval);
                let haveCommonStudents = false;

                for (const cls1 of previousClasses) {
                    for (const cls2 of classes) {
                        // Both require slots
                        if (
                            cls1.course.needsSlot &&
                            cls2.course.needsSlot &&
                            // Both have different campus
                            cls1.room!.campus !== cls2.room!.campus &&
                            // Both have same department and are in conflicting departments
                            cls1.course.department === cls2.course.department &&
                            data.departmentsWithConflicts.indexOf(
                                cls1.course.department
                            ) !== -1
                        ) {
                            haveCommonStudents = true;
                            ++studentTravel;
                        }
                    }
                }

                previousClasses = classes;
                previousInterval = interval;

                // At least 1 hour for faculty
                if (gap < 60 && haveCommonStudents) {
                    hasConflicts = true;
                }
            }

            if (studentTravel > 1) {
                hasConflicts = true;
            }
        }
        return hasConflicts
            ? [new Conflict(ConflictType.StudentTravel, [], studentTravel)]
            : [];
    };

    static getPossibleSlotCombinations = (
        data: Data,
        lectureType: string,
        credits: number,
        remainingCredits: number,
        allottedSlots: Slot[],
        combinations: Map<number, Map<string, Slot[][]>>
    ) => {
        if (remainingCredits <= 0) {
            if (!combinations.has(credits)) {
                combinations.set(credits, new Map<LectureType, Slot[][]>());
            }
            if (!combinations.get(credits)!.has(lectureType)) {
                combinations.get(credits)!.set(lectureType, []);
            }
            combinations.get(credits)!.get(lectureType)!.push(allottedSlots);
            return;
        }
        for (let i = data.maxSlotCredits; i >= data.minSlotCredits; i -= 0.5) {
            for (const slot of data.slots) {
                if (
                    slot.credits === i &&
                    slot.lectureType === lectureType &&
                    allottedSlots.indexOf(slot) === -1
                ) {
                    Class.getPossibleSlotCombinations(
                        data,
                        lectureType,
                        credits,
                        remainingCredits - i,
                        [...allottedSlots, slot],
                        combinations
                    );
                }
            }
        }
    };

    static getWeekdayWiseSchedule = (classes: Class[]) => {
        const weekDays = getEnumKeys(WeekDay) as WeekDay[];
        const tempResult: [Class, Interval, Slot][][] = [];
        weekDays.forEach((weekDay, weekIdx) => {
            tempResult.push([]);
            classes.forEach((cls) => {
                cls.slots.forEach((slot) => {
                    const intervals = Slot.getTimeOnDay(slot, weekDay);
                    intervals.forEach((interval) => {
                        tempResult[weekIdx].push([cls, interval, slot]);
                    });
                });
            });
        });
        const intervalsSet: Interval[] = [];
        const result: Map<number, [Class, Interval, Slot][]>[] = [];
        tempResult.forEach((arr, weekIdx) => {
            result.push(new Map<number, [Class, Interval, Slot][]>());
            arr.forEach((ci) => {
                const startMinutes = Interval.getMinutes(ci[1])[0];
                if (!result[weekIdx].has(startMinutes)) {
                    result[weekIdx].set(startMinutes, []);
                }
                result[weekIdx].get(startMinutes)!.push(ci);
                if (
                    intervalsSet.findIndex((interval) =>
                        Interval.doesStartsSame(interval, ci[1])
                    ) === -1
                ) {
                    intervalsSet.push(ci[1]);
                }
            });
        });
        intervalsSet.sort((i1, i2) => {
            if (Interval.isBefore(i1, i2)) {
                return -1;
            }
            return 1;
        });
        result.forEach((map, idx) => {
            intervalsSet.forEach((interval) => {
                const startMinutes = Interval.getMinutes(interval)[0];
                if (!map.has(startMinutes)) {
                    map.set(startMinutes, []);
                }
            });
            result[idx] = new Map(
                [...result[idx].entries()].sort((a, b) => a[0] - b[0])
            );
        });
        return [result, intervalsSet] as [
            Map<number, [Class, Interval, Slot][]>[],
            Interval[]
        ];
    };

    static getSlotToClassMapping = (classes: Class[], data: Data) => {
        const slotMapping: Map<Slot, Class[]> = new Map();
        data.slots.forEach((slot) => {
            classes.forEach((cls) => {
                if (cls.slots.indexOf(slot) !== -1) {
                    if (!slotMapping.has(slot)) {
                        slotMapping.set(slot, []);
                    }
                    slotMapping.get(slot)!.push(cls);
                }
            });
        });
        return slotMapping;
    };

    static getRoomToClassMapping = (classes: Class[], data: Data) => {
        const roomMapping: Map<Room, Class[]> = new Map();
        data.rooms.forEach((room) => {
            classes.forEach((cls) => {
                if (cls.room === room) {
                    if (!roomMapping.has(room)) {
                        roomMapping.set(room, []);
                    }
                    roomMapping.get(room)!.push(cls);
                }
            });
        });
        return roomMapping;
    };

    static getFacultyToClassMapping = (classes: Class[], data: Data) => {
        const facultyMapping: Map<Faculty, Class[]> = new Map();
        data.faculties.forEach((fac) => {
            classes.forEach((cls) => {
                if (cls.course.faculties.indexOf(fac) !== -1) {
                    if (!facultyMapping.has(fac)) {
                        facultyMapping.set(fac, []);
                    }
                    facultyMapping.get(fac)!.push(cls);
                }
            });
        });
        return facultyMapping;
    };
}
