/* eslint-disable @typescript-eslint/no-non-null-assertion */
import shuffle from "lodash/shuffle";

import { Class, Data, ISchedule } from "@ta/shared/models";

// A Single Chromosome
export default class Schedule implements ISchedule {
    public classes: Class[] = [];
    public allocatedClasses: Class[] = [];
    public unallocatedClasses: Class[] = [];
    private _fitness = -1;

    constructor(public data: Data) {
        this.initialize = this.initialize.bind(this);
    }

    get fitness() {
        this._fitness = this.allocatedClasses.length / this.classes.length;
        return this._fitness;
    }

    initialize() {
        // Create a new class for each course
        this.data.courses.forEach((course, i) => {
            const newClass = new Class<null>(i + 1, course);
            this.classes.push(newClass);
        });
        // Shuffle the classes array
        this.classes = shuffle(this.classes);

        for (const cls of this.classes) {
            const lectureType = cls.course.lectureType;
            const totalCredits = cls.course.totalCredits;
            // Get possible slot combinations for this lecture type and credits if not present
            if (
                !this.data.possibleSlotCombinations.has(totalCredits) ||
                !this.data.possibleSlotCombinations
                    .get(totalCredits)!
                    .has(lectureType)
            ) {
                Class.getPossibleSlotCombinations(
                    this.data,
                    lectureType,
                    totalCredits,
                    totalCredits,
                    [],
                    this.data.possibleSlotCombinations
                );
            }

            // Try for each pair of slot combination and eligible room
            const isAllocated = Class.allocateSlot(
                cls,
                this.allocatedClasses,
                this.data
            );

            if (!isAllocated) {
                this.unallocatedClasses.push(cls);
            }
        }
        this.data.logFunction("Initialized Schedule!");
        return this;
    }

    toString = () =>
        this.allocatedClasses.map((cls) => cls.toString()).join(", ");
}
