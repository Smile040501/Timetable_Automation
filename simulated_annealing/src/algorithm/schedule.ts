import random from "lodash/random";
import intersection from "lodash/intersection";

import Interval from "./utils/interval";
import Class from "./class";
import Data from "./data";
import Conflict from "./models/conflict";
import { ConflictType, CourseType, LectureType, WeekDay } from "./utils/enums";
import Slot from "./models/slot";
import Room from "./models/room";
import Faculty from "./models/faculty";
import { getEnumKeys } from "./utils/utils";
import Course from "./models/course";

// A Single Chromosome
export default class Schedule {
    private _classes: Class[] = [];
    private _fitness: number = -1;
    public conflicts: Conflict[] = [];
    public isFitnessChanged: boolean = true;

    public get classes(): Class[] {
        this.isFitnessChanged = true;
        return this._classes;
    }

    public get fitness(): number {
        if (this.isFitnessChanged) {
            this.calculateFitness();
            this.isFitnessChanged = false;
        }
        return this._fitness;
    }

    constructor(public data: Data) {}

    initialize = () => {
        this.data.courses.forEach((course, i) => {
            // Create a new class for each course
            const newClass = new Class(i + 1, course);
            this.classes.push(newClass);

            if (!course.needsSlot) {
                return;
            }

            // Allocate slots which satisfy the credit requirements first
            this.allocateSlot(course, course.totalCredits, newClass.slots);

            // Only give those rooms to classes with enough capacity and satisfied feature
            // For lab course, only a lab room
            // For normal course, both lab and normal room are fine
            const eligibleRooms = this.data.rooms.filter((room) => {
                if (room.capacity < course.maxNumberOfStudents) {
                    return false;
                }
                if (course.lectureType === LectureType.Lab) {
                    return room.lectureType === course.lectureType;
                }
                return true;
            });
            newClass.room = eligibleRooms[random(0, eligibleRooms.length - 1)];
        });

        return this;
    };

    allocateSlot = (
        course: Course,
        remainingCredits: number,
        allottedSlots: Slot[]
    ) => {
        if (remainingCredits <= 0) {
            return;
        }
        let credits = 0;
        let eligibleSlots: Slot[] = [];
        while (eligibleSlots.length === 0) {
            credits = random(1, 4);
            for (const slot of this.data.slots) {
                if (
                    slot.credits === credits &&
                    slot.lectureType === course.lectureType &&
                    allottedSlots.indexOf(slot) === -1
                ) {
                    eligibleSlots.push(slot);
                }
            }
        }
        allottedSlots.push(eligibleSlots[random(0, eligibleSlots.length - 1)]);
        this.allocateSlot(course, remainingCredits - credits, allottedSlots);
    };

    calculateFitness = () => {
        this.conflicts = [];
        let fitnessMultipliers: number[] = [];

        for (let i = 0; i < this.classes.length; ++i) {
            const cls1 = this.classes[i];
            if (!cls1.course.needsSlot) {
                continue;
            }

            // Seating Capacity Conflict
            // Should never happen coz of the way we initialize
            if (cls1.room!.capacity < cls1.course.maxNumberOfStudents) {
                this.conflicts.push(
                    new Conflict(ConflictType.RoomCapacity, [cls1])
                );
            }

            // Room Feature Conflict
            if (cls1.course.lectureType === LectureType.Lab) {
                if (cls1.room!.lectureType !== LectureType.Lab) {
                    this.conflicts.push(
                        new Conflict(ConflictType.RoomFeature, [cls1])
                    );
                }
            } else {
                // Lose 5% fitness if a normal course is assigned a lab room
                if (cls1.room!.lectureType === LectureType.Lab) {
                    fitnessMultipliers.push(0.95);
                }
            }

            for (let j = i + 1; j < this.classes.length; ++j) {
                const cls2 = this.classes[j];
                if (!cls2.course.needsSlot) {
                    continue;
                }

                // If Classes overlap
                if (cls1.id !== cls2.id && cls1.isOverlapping(cls2)) {
                    // Same Instructor Booking Conflict
                    if (
                        intersection(
                            cls1.course.faculties,
                            cls2.course.faculties
                        ).length !== 0
                    ) {
                        this.conflicts.push(
                            new Conflict(ConflictType.InstructorBooking, [
                                cls1,
                                cls2,
                            ])
                        );
                    }

                    // Same Student Group Booking Conflict
                    if (cls1.course.department === cls2.course.department) {
                        // If classes are from the same department with conflicts
                        if (
                            this.data.departmentsWithConflicts.indexOf(
                                cls1.course.department
                            ) !== -1
                        ) {
                            // Don't allow any other course from same department with PMT and PMP courses
                            if (
                                cls1.course.courseType === CourseType.PMT ||
                                cls1.course.courseType === CourseType.PMP ||
                                cls2.course.courseType === CourseType.PMT ||
                                cls2.course.courseType === CourseType.PMP
                            ) {
                                this.conflicts.push(
                                    new Conflict(ConflictType.StudentBooking, [
                                        cls1,
                                        cls2,
                                    ])
                                );
                            } else {
                                fitnessMultipliers.push(0.5);
                            }
                        } else {
                            // If classes are from the same department with no conflicts
                            fitnessMultipliers.push(1.5);
                        }
                    }

                    // Same Room Booking Conflict
                    if (cls1.room === cls2.room) {
                        this.conflicts.push(
                            new Conflict(ConflictType.RoomBooking, [cls1, cls2])
                        );
                    }
                }
            }
        }

        const [weekWiseSchedule] = this.getWeekdayWiseSchedule();
        weekWiseSchedule.forEach((map, weekIdx) => {
            let facultyTravel = 0,
                studentTravel = 0;
            const sch = [...map.entries()];
            let previousClasses: Class[] = [];
            let previousInterval: Interval = new Interval("08:00", "08:50");
            for (let i = 0; i < sch.length; ++i) {
                const classes = sch[i][1].map((cis) => cis[0]);
                if (classes.length === 0) {
                    continue;
                }
                const interval = sch[i][1][0][1];
                if (previousClasses.length === 0) {
                    previousClasses = classes;
                    previousInterval = interval;
                    continue;
                }

                const gap = previousInterval.getGap(interval);
                let haveCommonFaculty = false,
                    haveCommonStudent = false;

                for (const cls1 of previousClasses) {
                    for (const cls2 of classes) {
                        // Both require slots
                        if (
                            cls1.course.needsSlot &&
                            cls2.course.needsSlot &&
                            // Both have different campus
                            cls1.room!.campus !== cls2.room!.campus
                        ) {
                            // Both have common faculties
                            if (
                                intersection(
                                    cls1.course.faculties,
                                    cls2.course.faculties
                                ).length !== 0
                            ) {
                                haveCommonFaculty = true;
                                ++facultyTravel;
                            }
                        }

                        if (
                            // Both have same department and are in conflicting departments
                            cls1.course.department === cls2.course.department &&
                            this.data.departmentsWithConflicts.indexOf(
                                cls1.course.department
                            ) !== -1
                        ) {
                            haveCommonStudent = true;
                            ++studentTravel;
                        }
                    }
                }

                previousClasses = classes;
                previousInterval = interval;

                // At least 1 hour for faculty and student travel
                if (gap < 60 && (haveCommonFaculty || haveCommonStudent)) {
                    fitnessMultipliers.push(0.01);
                }
            }

            if (facultyTravel > 1) {
                fitnessMultipliers.push(1 / facultyTravel);
                // this.conflicts.push(
                //     new Conflict(
                //         ConflictType.FacultyTravel,
                //         [],
                //         `WeekDay ${weekIdx + 1}: ${facultyTravel}`
                //     )
                // );
            }

            if (studentTravel > 1) {
                fitnessMultipliers.push(1 / studentTravel);
                // this.conflicts.push(
                //     new Conflict(
                //         ConflictType.StudentTravel,
                //         [],
                //         `WeekDay ${weekIdx + 1}: ${studentTravel}`
                //     )
                // );
            }
        });

        this._fitness = 1 / (1.0 * this.conflicts.length + 1);

        if (this.conflicts.length !== 0) {
            // Sort and make it unique
            fitnessMultipliers.sort();
            fitnessMultipliers = [...new Set(fitnessMultipliers)];
            fitnessMultipliers.forEach((multiplier) => {
                this._fitness *= multiplier;
            });
        }
    };

    getWeekdayWiseSchedule = () => {
        const weekDays = getEnumKeys(WeekDay) as WeekDay[];
        const tempResult: [Class, Interval, Slot][][] = [];
        weekDays.forEach((weekDay, weekIdx) => {
            tempResult.push([]);
            this._classes.forEach((cls) => {
                cls.slots.forEach((slot) => {
                    const intervals = slot.getTimeOnDay(weekDay);
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
                        interval.doesStartsSame(ci[1])
                    ) === -1
                ) {
                    intervalsSet.push(ci[1]);
                }
            });
        });
        intervalsSet.sort((i1, i2) => {
            if (i1.isBefore(i2)) {
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

    getSlotToClassMapping = () => {
        const slotMapping: Map<Slot, Class[]> = new Map();
        this.data.slots.forEach((slot) => {
            this.classes.forEach((cls) => {
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

    getRoomToClassMapping = () => {
        const roomMapping: Map<Room, Class[]> = new Map();
        this.data.rooms.forEach((room) => {
            this.classes.forEach((cls) => {
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

    getFacultyToClassMapping = () => {
        const facultyMapping: Map<Faculty, Class[]> = new Map();
        Object.values(this.data.departments).forEach((dept) => {
            dept.faculties.forEach((fac) => {
                this.classes.forEach((cls) => {
                    if (cls.course.faculties.indexOf(fac) !== -1) {
                        if (!facultyMapping.has(fac)) {
                            facultyMapping.set(fac, []);
                        }
                        facultyMapping.get(fac)!.push(cls);
                    }
                });
            });
        });
        return facultyMapping;
    };

    toString = () => this.classes.map((cls) => cls.toString()).join(", ");

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
        if (Schedule.isClassPresent(cls, allocatedClasses)) {
            return true;
        }

        const lectureType = cls.course.lectureType;
        const totalCredits = cls.course.totalCredits;
        const slotCombinations = data.possibleSlotCombinations
            .get(totalCredits)!
            .get(lectureType)!;
        const eligibleRooms = Schedule.getEligibleRooms(cls, data);

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
                const conflicts = Schedule.hasConflicts(
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
        conflicts.push(...Schedule.hasRoomCapacityConflict(cls));

        // Room Feature Conflict
        conflicts.push(...Schedule.hasRoomFeatureConflict(cls));

        // Instructor Booking Conflict
        conflicts.push(...Schedule.hasInstructorBookingConflict(cls, classes));

        // Student Booking Conflict
        conflicts.push(
            ...Schedule.hasStudentBookingConflict(cls, classes, data)
        );

        // Room Booking Conflict
        conflicts.push(...Schedule.hasRoomBookingConflict(cls, classes));

        const [weekWiseSchedule] = Schedule.getWeekdayWiseSchedule([
            cls,
            ...classes,
        ]);

        // Faculty Travel Conflict
        conflicts.push(...Schedule.hasFacultyTravelConflicts(weekWiseSchedule));

        // Student Travel Conflict
        conflicts.push(
            ...Schedule.hasStudentTravelConflicts(weekWiseSchedule, data)
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
                cls.isOverlapping(cls2) &&
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
                cls.isOverlapping(cls2) &&
                // Student Booking Conflict
                cls.course.department === cls2.course.department &&
                // Classes are from department with conflicts
                data.departmentsWithConflicts.indexOf(cls.course.department) !==
                    -1
            ) {
                conflicts.push(
                    new Conflict(
                        ConflictType.StudentBooking,
                        [cls, cls2],
                        cls2.course.courseType.toString()
                    )
                );
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
                cls.isOverlapping(cls2) &&
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

                const gap = previousInterval.getGap(interval);
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

                const gap = previousInterval.getGap(interval);
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
        lectureType: LectureType,
        credits: number,
        remainingCredits: number,
        allottedSlots: Slot[],
        combinations: Map<number, Map<LectureType, Slot[][]>>
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
        for (let i = 4; i >= 1; --i) {
            for (const slot of data.slots) {
                if (
                    slot.credits === i &&
                    slot.lectureType === lectureType &&
                    allottedSlots.indexOf(slot) === -1
                ) {
                    Schedule.getPossibleSlotCombinations(
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
                    const intervals = slot.getTimeOnDay(weekDay);
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
                        interval.doesStartsSame(ci[1])
                    ) === -1
                ) {
                    intervalsSet.push(ci[1]);
                }
            });
        });
        intervalsSet.sort((i1, i2) => {
            if (i1.isBefore(i2)) {
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
}