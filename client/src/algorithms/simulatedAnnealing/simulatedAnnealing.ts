import cloneDeep from "lodash/cloneDeep";
import pullAt from "lodash/pullAt";
import sample from "lodash/sample";
import sampleSize from "lodash/sampleSize";

import Class from "../models/class";
import Data from "../models/data";
import { ConflictType, CourseType } from "../utils/enums";

export default class SimulatedAnnealing {
    HARD_CONSTRAINT_MULTIPLIER = 100000; // TODO
    SOFT_CONSTRAINT_MULTIPLIER = 100; // TODO
    INITIAL_TEMPERATURE = 80000; // TODO
    FINAL_TEMPERATURE = 0.00001; // TODO
    N_MOVE = 500; // TODO

    constructor(public currClassAllocation: Class[], public data: Data) {}

    roomCapacityConflictCost = (
        currClassAllocation: Class[],
        returnConflicts = false
    ) => {
        let costVal = 0;

        for (const cls of currClassAllocation) {
            let roomCapacityConflicts = Class.hasRoomCapacityConflict(cls);
            for (const roomCapacityConflict of roomCapacityConflicts) {
                if (
                    roomCapacityConflict.conflictType !==
                    ConflictType.RoomCapacity
                )
                    console.error("RoomCapacity ConflictType error");
                costVal += 1;
            }
        }

        if (returnConflicts) return costVal;

        return costVal * this.SOFT_CONSTRAINT_MULTIPLIER;
    };

    instructorConflictCost = (
        currClassAllocation: Class[],
        returnConflicts = false
    ) => {
        let costVal = 0;

        for (const cls of currClassAllocation) {
            let arr = currClassAllocation.filter((iterCls) => iterCls !== cls);
            let instructorConflicts = Class.hasInstructorBookingConflict(
                cls,
                arr
            );
            for (const instructorConflict of instructorConflicts) {
                if (
                    instructorConflict.conflictType !==
                    ConflictType.InstructorBooking
                )
                    console.error("Instructor ConflictType error");
                costVal++;
            }
        }

        if (returnConflicts) return costVal;
        return costVal * this.HARD_CONSTRAINT_MULTIPLIER;
    };

    studentGroupConflictCost = (
        currClassAllocation: Class[],
        returnConflicts = false
    ) => {
        let costVal = 0,
            totConflicts = 0;

        for (const cls of currClassAllocation) {
            let arr = currClassAllocation.filter((iterCls) => iterCls !== cls);
            let studentGroupConflicts = Class.hasStudentBookingConflict(
                cls,
                arr,
                this.data
            );
            for (const studentGroupConflict of studentGroupConflicts) {
                if (
                    studentGroupConflict.conflictType !==
                    ConflictType.StudentBooking
                )
                    console.error("StudentGroup ConflictType error");

                // if (
                //     (cls.course.courseType === CourseType.PMP ||
                //         cls.course.courseType === CourseType.PMT) &&
                //     (studentGroupConflict.otherInfo === "PMP" ||
                //         studentGroupConflict.otherInfo === "PMT")
                // ) {
                //     costVal += this.HARD_CONSTRAINT_MULTIPLIER;
                //     totConflicts++; // TODO - Change this later
                // } else costVal += this.SOFT_CONSTRAINT_MULTIPLIER;
                costVal += this.HARD_CONSTRAINT_MULTIPLIER;
                totConflicts++;
            }
        }

        if (returnConflicts) return totConflicts;
        return costVal;
    };

    roomConflictCost = (
        currClassAllocation: Class[],
        returnConflicts = false
    ) => {
        let costVal = 0;

        for (const cls of currClassAllocation) {
            let arr = currClassAllocation.filter((iterCls) => iterCls !== cls);
            let roomConflicts = Class.hasRoomBookingConflict(cls, arr);
            for (const roomConflict of roomConflicts) {
                if (roomConflict.conflictType !== ConflictType.RoomBooking)
                    console.error("RoomBooking ConflictType error");
                costVal++;
            }
        }

        if (returnConflicts) return costVal;
        return costVal * this.HARD_CONSTRAINT_MULTIPLIER;
    };

    facultyTravelConflictCost = (
        currClassAllocation: Class[],
        returnConflicts = false
    ) => {
        let costVal = 0;
        let [currSchedule] = Class.getWeekdayWiseSchedule(currClassAllocation);

        const facultyTravelConflicts =
            Class.hasFacultyTravelConflicts(currSchedule);

        costVal +=
            facultyTravelConflicts.length === 0
                ? 0
                : (facultyTravelConflicts[0].otherInfo as number);

        if (returnConflicts) return costVal;
        return costVal * this.SOFT_CONSTRAINT_MULTIPLIER;
    };

    studentTravelConflictCost = (
        currClassAllocation: Class[],
        returnConflicts = false
    ) => {
        let costVal = 0;
        let [currSchedule] = Class.getWeekdayWiseSchedule(currClassAllocation);

        const studentTravelConflicts = Class.hasStudentTravelConflicts(
            currSchedule,
            this.data
        );

        costVal +=
            studentTravelConflicts.length === 0
                ? 0
                : (studentTravelConflicts[0].otherInfo as number);

        if (returnConflicts) return costVal;
        return costVal * this.SOFT_CONSTRAINT_MULTIPLIER;
    };

    totalConflicts = (currClassAllocation: Class[]) => {
        let conflicts = 0;
        // let tempCurrClassAllocation = cloneDeep(currClassAllocation);

        // for (const cls of currClassAllocation) {
        //     let arr = tempCurrClassAllocation.filter(
        //         (iterCls) => iterCls !== cls
        //     );
        //     conflicts += Schedule.hasConflicts(cls, arr, this.data).length;
        // }
        // return conflicts / 2;
        conflicts =
            this.roomCapacityConflictCost(currClassAllocation, true) +
            this.instructorConflictCost(currClassAllocation, true) / 2 +
            this.studentGroupConflictCost(currClassAllocation, true) / 2 +
            this.roomConflictCost(currClassAllocation, true) / 2;
        // this.facultyTravelConflictCost(currClassAllocation, true) +
        // this.studentTravelConflictCost(currClassAllocation, true);

        return conflicts;
    };

    cost = (currClassAllocation: Class[]) => {
        let costVal = 0;

        // Add room capacity conflict cost
        costVal += this.roomCapacityConflictCost(currClassAllocation);

        // Add instructor booking conflict
        costVal += this.instructorConflictCost(currClassAllocation);

        // Add student booking conflict
        costVal += this.studentGroupConflictCost(currClassAllocation);

        // Add room booking conflict
        costVal += this.roomConflictCost(currClassAllocation);

        // Add faculty travel conflict
        // costVal += this.facultyTravelConflictCost(currClassAllocation);

        // Add student travel conflict
        // costVal += this.studentTravelConflictCost(currClassAllocation);

        return costVal;
    };

    temperature = (currTemperature: number) => {
        // Current implementation based on https://www.researchgate.net/publication/224398617
        return (
            currTemperature *
            (1 -
                (Math.log(currTemperature) - Math.log(this.FINAL_TEMPERATURE)) /
                    this.N_MOVE)
        );
    };

    acceptanceProbability = (
        oldCost: number,
        newCost: number,
        temperature: number
    ) => {
        if (newCost < oldCost) return 1.0;
        else return Math.exp((oldCost - newCost) / temperature);
    };

    neighbor2 = () => {
        let breakCheck = false;
        let copyCurrClassAllocation = cloneDeep(this.currClassAllocation);

        while (!breakCheck) {
            let [randomClass1, randomClass2] = sampleSize(
                copyCurrClassAllocation,
                2
            );

            if (randomClass1.course.courseType === CourseType.PROJECT) continue;
            if (randomClass2.course.courseType === CourseType.PROJECT) continue;

            let randomSlotFromClass1 = sample(randomClass1.slots),
                totSlotCredit1 = 0;

            let randomSlotFromClass2 = sample(randomClass1.slots),
                totSlotCredit2 = 0;

            for (const slt of randomClass1.slots) totSlotCredit1 += slt.credits;
            for (const slt of randomClass2.slots) totSlotCredit2 += slt.credits;

            let [randomSlotFromData1, randomSlotFromData2] = sampleSize(
                this.data.slots,
                2
            );

            if (
                randomSlotFromData1!.lectureType !==
                    randomSlotFromClass1!.lectureType &&
                randomSlotFromData2!.lectureType !==
                    randomSlotFromClass2!.lectureType
            )
                continue;

            if (
                totSlotCredit1 -
                    randomSlotFromClass1!.credits +
                    randomSlotFromData1!.credits <
                randomClass1.course.totalCredits
            )
                continue;

            if (
                totSlotCredit2 -
                    randomSlotFromClass2!.credits +
                    randomSlotFromData2!.credits <
                randomClass2.course.totalCredits
            )
                continue;

            // The new random slot should not be alloted already
            if (
                randomClass1.slots.indexOf(randomSlotFromData1) !== -1 ||
                randomClass2.slots.indexOf(randomSlotFromData2) !== -1
            )
                continue;

            pullAt(
                randomClass1.slots,
                randomClass1.slots.indexOf(randomSlotFromClass1!)
            );
            randomClass1.slots.push(randomSlotFromData1!);

            pullAt(
                randomClass2.slots,
                randomClass2.slots.indexOf(randomSlotFromClass2!)
            );
            randomClass2.slots.push(randomSlotFromData2!);

            breakCheck = true;
        }

        return copyCurrClassAllocation;
    };

    neighbor1 = () => {
        let breakCheck = false;
        let copyCurrClassAllocation = cloneDeep(this.currClassAllocation);

        while (!breakCheck) {
            let [randomClass1] = sampleSize(copyCurrClassAllocation, 1);

            if (randomClass1.course.courseType === CourseType.PROJECT) continue;

            let randomSlotFromClass1 = sample(randomClass1.slots),
                totSlotCredit1 = 0;

            for (const slt of randomClass1.slots) totSlotCredit1 += slt.credits;

            let randomSlotFromData = sample(this.data.slots);

            if (
                randomSlotFromData!.lectureType !==
                randomSlotFromClass1!.lectureType
            )
                continue;

            if (
                totSlotCredit1 -
                    randomSlotFromClass1!.credits +
                    randomSlotFromData!.credits <
                randomClass1.course.totalCredits
            )
                continue;

            // The new random slot should not be alloted already
            if (randomClass1.slots.indexOf(randomSlotFromData!) !== -1)
                continue;

            pullAt(
                randomClass1.slots,
                randomClass1.slots.indexOf(randomSlotFromClass1!)
            );
            randomClass1.slots.push(randomSlotFromData!);

            breakCheck = true;
        }

        return copyCurrClassAllocation;
    };

    neighbor = () => {
        // TODO - Check if logic of neighbor function is working properly
        let breakCheck = false;
        let copyCurrClassAllocation = cloneDeep(this.currClassAllocation);

        while (!breakCheck) {
            let [randomClass1, randomClass2] = sampleSize(
                copyCurrClassAllocation,
                2
            );

            if (
                randomClass1.course.courseType === CourseType.PROJECT ||
                randomClass2.course.courseType === CourseType.PROJECT
            )
                continue;
            let randomSlotFromClass1 = sample(randomClass1.slots);
            let randomSlotFromClass2 = sample(randomClass2.slots);

            let [totSlotCredit1, totSlotCredit2] = [0, 0];
            for (const slt of randomClass1.slots) totSlotCredit1 += slt.credits;
            for (const slt of randomClass2.slots) totSlotCredit2 += slt.credits;

            // TODO - Check if this needs to be changed to a hard constraint instead
            if (
                totSlotCredit1 -
                    randomSlotFromClass1!.credits +
                    randomSlotFromClass2!.credits <
                randomClass1.course.totalCredits
            )
                continue;

            if (
                totSlotCredit2 -
                    randomSlotFromClass2!.credits +
                    randomSlotFromClass1!.credits <
                randomClass2.course.totalCredits
            )
                continue;

            if (
                randomSlotFromClass1!.lectureType !==
                randomSlotFromClass2!.lectureType
            )
                continue;

            // The new random slot should not be alloted already
            if (
                randomClass1.slots.indexOf(randomSlotFromClass2!) !== -1 ||
                randomClass2.slots.indexOf(randomSlotFromClass1!) !== -1
            )
                continue;

            // TODO - check if the below logic is working correctly
            pullAt(
                randomClass1.slots,
                randomClass1.slots.indexOf(randomSlotFromClass1!)
            );
            randomClass1.slots.push(randomSlotFromClass2!);

            pullAt(
                randomClass2.slots,
                randomClass2.slots.indexOf(randomSlotFromClass2!)
            );
            randomClass2.slots.push(randomSlotFromClass1!);

            breakCheck = true;
        }

        return copyCurrClassAllocation;
    };

    execute = () => {
        let currTemperature = this.INITIAL_TEMPERATURE;
        let bestAllocation = this.currClassAllocation;

        let iter_mod_5 = 0;
        let reHeat = 0;
        let turn = 0;

        while (Math.abs(currTemperature - this.FINAL_TEMPERATURE) >= 0.000001) {
            let nextAllocation = null;
            if (turn === 0) nextAllocation = this.neighbor();
            else if (turn === 1) nextAllocation = this.neighbor1();
            else nextAllocation = this.neighbor2();

            turn = (turn + 1) % 3;

            let currCost = this.cost(this.currClassAllocation),
                nextCost = this.cost(nextAllocation),
                bestCost = this.cost(bestAllocation);

            this.data.logFunction(`Best Cost: ${bestCost}`);
            this.data.logFunction(`   Current Temperature: ${currTemperature}`);
            this.data.logFunction(
                `      Current conflicts: ${this.totalConflicts(
                    this.currClassAllocation
                )}`
            );
            this.data.logFunction(
                `      Best conflicts: ${this.totalConflicts(bestAllocation)}`
            );
            this.data.logFunction(`      Reheat value: ${reHeat}`);

            if (currCost < bestCost) bestAllocation = this.currClassAllocation;
            if (
                this.acceptanceProbability(
                    currCost,
                    nextCost,
                    currTemperature
                ) >= Math.random()
            )
                this.currClassAllocation = nextAllocation;

            if (iter_mod_5 === 2)
                currTemperature = this.temperature(currTemperature);
            iter_mod_5 = (iter_mod_5 + 1) % 3;

            if (this.cost(this.currClassAllocation) === currCost) {
                if (reHeat === 360) reHeat -= 100;
                reHeat++;
            } else reHeat = 0;

            if (reHeat === 360) {
                currTemperature = this.INITIAL_TEMPERATURE;
            }

            if (currCost <= 2 * this.HARD_CONSTRAINT_MULTIPLIER) break;
        }

        return bestAllocation;
    };
}
