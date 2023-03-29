import cloneDeep from "lodash/cloneDeep";
import sampleSize from "lodash/sampleSize";
import sample from "lodash/sample";

import Data from "./data";
import Schedule from "./schedule";
import Class from "./class";
import { ConflictType, CourseType, LectureType, WeekDay } from "./utils/enums";
import { pullAt } from "lodash";
import Course from "./models/course";
import Slot from "./models/slot";
import Room from "./models/room";
import Interval from "./utils/interval";

export default class SimulatedAnnealing {
    HARD_CONSTRAINT_MULTIPLIER = 100000; // TODO
    SOFT_CONSTRAINT_MULTIPLIER = 100; // TODO
    INITIAL_TEMPERATURE = 100000; // TODO
    FINAL_TEMPERATURE = 0.00001; // TODO
    N_MOVE = 500; // TODO

    constructor(public currClassAllocation: Class[], public data: Data) {}

    roomCapacityConflictCost = (
        currClassAllocation: Class[],
        returnConflicts = false
    ) => {
        let costVal = 0;

        for (const cls of currClassAllocation) {
            let roomCapacityConflicts = Schedule.hasRoomCapacityConflict(cls);
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
        let tempCurrClassAllocation = cloneDeep(currClassAllocation);

        for (const cls of tempCurrClassAllocation) {
            let arr = tempCurrClassAllocation.filter(
                (iterCls) => iterCls !== cls
            );
            let instructorConflicts = Schedule.hasInstructorBookingConflict(
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

        let tempCurrClassAllocation = cloneDeep(currClassAllocation);

        for (const cls of tempCurrClassAllocation) {
            let arr = tempCurrClassAllocation.filter(
                (iterCls) => iterCls !== cls
            );
            let studentGroupConflicts = Schedule.hasStudentBookingConflict(
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
            // console.log("Student conflicts log", studentGroupConflicts);
        }

        if (returnConflicts) return totConflicts;
        return costVal;
    };

    roomConflictCost = (
        currClassAllocation: Class[],
        returnConflicts = false
    ) => {
        let costVal = 0;
        let tempCurrClassAllocation = cloneDeep(currClassAllocation);

        for (const cls of tempCurrClassAllocation) {
            let arr = tempCurrClassAllocation.filter(
                (iterCls) => iterCls !== cls
            );
            let roomConflicts = Schedule.hasRoomBookingConflict(cls, arr);
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
        let [currSchedule] =
            Schedule.getWeekdayWiseSchedule(currClassAllocation);

        costVal +=
            Schedule.hasFacultyTravelConflicts(currSchedule).length === 0
                ? 0
                : (Schedule.hasFacultyTravelConflicts(currSchedule)[0]
                      .otherInfo as number);

        if (returnConflicts) return costVal;
        return costVal * this.SOFT_CONSTRAINT_MULTIPLIER;
    };

    studentTravelConflictCost = (
        currClassAllocation: Class[],
        returnConflicts = false
    ) => {
        let costVal = 0;
        let [currSchedule] =
            Schedule.getWeekdayWiseSchedule(currClassAllocation);

        costVal +=
            Schedule.hasStudentTravelConflicts(currSchedule, this.data)
                .length === 0
                ? 0
                : (Schedule.hasStudentTravelConflicts(
                      currSchedule,
                      this.data
                  )[0].otherInfo as number);

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
        let t = this.studentGroupConflictCost(currClassAllocation, true);
        if (t % 2 !== 0 && t <= 41) {
            console.log("Hi");
            t = this.studentGroupConflictCost(currClassAllocation, true);
        }
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

    neighbor = () => {
        // TODO - Check if logic if neighbor function is working properly
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

        const c1 = {
            id: 16,
            course: {
                id: 16,
                code: "C16",
                name: "C16",
                credits: [1, 1, 1, 3],
                courseType: "PME",
                lectureType: "Normal",
                maxNumberOfStudents: 60,
                faculties: [
                    {
                        id: 107,
                        name: "F17",
                    },
                ],
                department: "EE",
                needsSlot: true,
                totalCredits: 3,
            } as Course,
            slots: [
                {
                    id: 12,
                    name: "F",
                    lectureType: "Normal" as LectureType,
                    dayTime: [
                        ["Tuesday" as WeekDay, new Interval("09:00", "10:15")],
                        ["Thursday" as WeekDay, new Interval("09:00", "10:15")],
                        ["Friday" as WeekDay, new Interval("17:00", "17:50")],
                    ] as [WeekDay, Interval][],
                    credits: 4,
                } as Slot,
            ] as Slot[],
            room: {
                id: 23,
                name: "R23",
                lectureType: "Normal",
                capacity: 100,
                campus: "Ahalia",
            } as Room,
        } as Class;

        const c2 = {
            id: 12,
            course: {
                id: 12,
                code: "C12",
                name: "C12",
                credits: [1, 1, 1, 3],
                courseType: "PMP",
                lectureType: "Lab",
                maxNumberOfStudents: 100,
                faculties: [
                    {
                        id: 103,
                        name: "F13",
                    },
                ],
                department: "EE",
                needsSlot: true,
                totalCredits: 3,
            } as Course,
            slots: [
                {
                    id: 9,
                    name: "P1",
                    lectureType: "Lab",
                    dayTime: [["Monday", new Interval("10:00", "12:50")]],
                    credits: 3,
                },
            ] as Slot[],
            room: {
                id: 29,
                name: "R29",
                lectureType: "Lab",
                capacity: 100,
                campus: "Ahalia",
            } as Room,
        } as Class;

        // console.log(this.totalConflicts([c1, c2]));
        // return;

        while (
            Math.abs(currTemperature - this.FINAL_TEMPERATURE) >= 0.0000001
        ) {
            let nextAllocation = this.neighbor(),
                currCost = this.cost(this.currClassAllocation),
                nextCost = this.cost(nextAllocation),
                bestCost = this.cost(bestAllocation);

            console.log("Best Cost:", bestCost);
            console.log("   Current Temperature:", currTemperature);
            console.log(
                "      Current conflicts:",
                this.totalConflicts(bestAllocation)
            );
            if (currCost < bestCost) bestAllocation = this.currClassAllocation;
            if (
                this.acceptanceProbability(
                    currCost,
                    nextCost,
                    currTemperature
                ) >= Math.random()
            )
                this.currClassAllocation = nextAllocation;
            currTemperature = this.temperature(currTemperature);
        }

        return bestAllocation;
    };
}
