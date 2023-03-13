import { CourseType, Departments, LectureType } from "../utils/enums";
import Faculty from "./faculty";

export default class Course {
    public totalCredits: number;

    constructor(
        public id: number,
        public code: string,
        public name: string,
        public credits: [number, number, number, number],
        public courseType: CourseType,
        public lectureType: LectureType,
        public maxNumberOfStudents: number,
        public faculties: Faculty[],
        public department: Departments,
        public needsSlot: boolean = true
    ) {
        this.totalCredits = credits[3];
    }

    toString = () =>
        `<${this.name} (${this.department}, ${this.lectureType}, ${
            this.totalCredits
        }) (${this.maxNumberOfStudents}) [${this.faculties
            .map((f) => f.toString())
            .join(", ")}]>`;
}
