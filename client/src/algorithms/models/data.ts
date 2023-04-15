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
import { CourseAsJSON, RoomAsJSON, SlotAsJSON } from "../../interfaces";

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
    public logFunction: (str: any) => void;

    constructor(
        random: boolean,
        numFaculty = 5,
        numPME = 1,
        expandedSlots = false,
        logFunc?: (str: any) => void,
        inputCourses: CourseAsJSON[] = [],
        inputRooms: RoomAsJSON[] = [],
        inputSlots: SlotAsJSON[] = []
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
            this.rooms = generateRooms(
                inputRooms.length !== 0 ? inputRooms : undefined
            );
            [this.courses, this.faculties] = generateCourses(
                inputCourses.length !== 0 ? inputCourses : undefined
            );
            this.slots = generateSlots(
                inputSlots.length !== 0 ? inputSlots : undefined
            );
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

        this.logFunction = (s) => {
            console.log(s);
            if (logFunc) logFunc(s);
        };

        this.logFunction("Initial Data:");
        this.logFunction(this);
    }
}
