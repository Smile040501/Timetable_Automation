import max from "lodash/max";
import min from "lodash/min";

import Course from "./course";
import Faculty from "./faculty";
import Room from "./room";
import Slot from "./slot";
import {
    generateRandomCourses,
    generateRandomDepartments,
    generateRandomDepartDist,
    generateRandomRooms,
    generateRandomSlots,
    RANDOM_NUM_ROOMS,
    DepartmentDist,
} from "../dataset/random";
import {
    generateRooms,
    generateCourses,
    generateSlots,
} from "../dataset/timetable";

export default class Data {
    public departmentDist: DepartmentDist | undefined;
    public rooms: Room[];
    public slots: Slot[];
    public courses: Course[];
    public faculties: Faculty[];
    public departmentsWithConflicts: string[];
    public departmentsWithNoConflicts: string[];
    public possibleSlotCombinations: Map<number, Map<string, Slot[][]>>;
    public maxSlotCredits: number;
    public minSlotCredits: number;

    constructor(
        random: boolean,
        numFaculty = 5,
        numPME = 1,
        expandedSlots = false
    ) {
        if (random) {
            this.departmentDist = generateRandomDepartDist(numFaculty, numPME);
            this.rooms = generateRandomRooms(RANDOM_NUM_ROOMS);

            const randomDepartments = generateRandomDepartments(
                this.departmentDist
            );
            this.faculties = Object.values(randomDepartments).flatMap(
                (dept) => dept.faculties
            );
            this.courses = generateRandomCourses(
                randomDepartments,
                this.departmentDist
            );

            this.slots = generateRandomSlots();
        } else {
            this.rooms = generateRooms();
            [this.courses, this.faculties] = generateCourses();
            this.slots = generateSlots();
        }

        if (expandedSlots) {
            this.slots = this.slots.flatMap((s) => Slot.getExpandedSlots(s));
        }

        this.departmentsWithConflicts = ["CSE", "EE", "ME", "CE", "GENERAL"];
        this.departmentsWithNoConflicts = ["GCE", "HSE", "SME"];
        this.possibleSlotCombinations = new Map<
            number,
            Map<string, Slot[][]>
        >();

        this.maxSlotCredits = max(this.slots.map((s) => s.credits))!;
        this.minSlotCredits = min(this.slots.map((s) => s.credits))!;

        console.log("Initial Data:", this);
    }
}
