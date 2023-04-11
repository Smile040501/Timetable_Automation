import intersection from "lodash/intersection";
import random from "lodash/random";
import range from "lodash/range";
import sample from "lodash/sample";

import Class from "../models/class";
import Conflict from "../models/conflict";
import Course from "../models/course";
import Data from "../models/data";
import ISchedule from "../models/iSchedule";
import Slot from "../models/slot";
import {
    ConflictType,
    CourseType,
    Departments,
    LectureType,
} from "../utils/enums";
import Interval from "../utils/interval";

// A Single Chromosome
export default class Schedule implements ISchedule {
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
            const eligibleRooms = Class.getEligibleRooms(newClass, this.data);
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
            credits = sample(
                range(
                    this.data.minSlotCredits,
                    this.data.maxSlotCredits + 0.5,
                    0.5
                )
            )!;
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
                if (cls1.id !== cls2.id && Class.isOverlapping(cls1, cls2)) {
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
                                cls1.course.department ===
                                    Departments.GENERAL ||
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
                                // Lose 50% fitness
                                fitnessMultipliers.push(0.5);
                            }
                        } else {
                            // If classes are from the same department with no conflicts
                            // Gain fitness
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

        const [weekWiseSchedule] = Class.getWeekdayWiseSchedule(this._classes);
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

                const gap = Interval.getGap(previousInterval, interval);
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
            }

            if (studentTravel > 1) {
                fitnessMultipliers.push(1 / studentTravel);
            }
        });

        this._fitness = 1 / (1.0 * this.conflicts.length + 1);

        // Sort and get unique fitness multipliers
        fitnessMultipliers.sort();
        fitnessMultipliers = [...new Set(fitnessMultipliers)];
        fitnessMultipliers.forEach((multiplier) => {
            this._fitness *= multiplier;
        });
    };

    toString = () => this.classes.map((cls) => cls.toString()).join(", ");
}
