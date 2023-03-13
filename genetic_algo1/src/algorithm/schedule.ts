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
            const eligibleSlots = this.data.slots.filter(
                (slot) => slot.credits >= course.totalCredits
            );
            if (eligibleSlots.length !== 0) {
                newClass.slots.push(
                    eligibleSlots[random(0, eligibleSlots.length - 1)]
                );
            } else {
                let slotCredits = 0;
                while (slotCredits < course.totalCredits) {
                    const slot =
                        this.data.slots[random(0, this.data.slots.length - 1)];
                    if (newClass.slots.indexOf(slot) === -1) {
                        newClass.slots.push(slot);
                        slotCredits += slot.credits;
                    }
                }
            }

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
}
