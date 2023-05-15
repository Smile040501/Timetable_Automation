import { CourseAsJSON } from "@ta/shared/utils";
import { Faculty } from "./faculty";

export class Course {
    public totalCredits: number;

    constructor(
        public courseID: number,
        public code: string,
        public name: string,
        public credits: [number, number, number, number],
        public courseType: string,
        public lectureType: string,
        public maxNumberOfStudents: number,
        public faculties: Faculty[],
        public department: string,
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

    static createCourseFromJSON = (courseID: number, course: CourseAsJSON) => {
        return new Course(
            courseID,
            course.code,
            course.name,
            course.credits,
            course.courseType,
            course.lectureType,
            course.maxNumberOfStudents,
            course.faculties.map((fac, idx) => new Faculty(idx, fac)),
            course.department
        );
    };

    static exportAsJSON = (courses: Course[]) => {
        return JSON.stringify(courses, (key, value) => {
            if (
                key === "courseID" ||
                key === "totalCredits" ||
                (key === "needsSlot" && value === true)
            ) {
                return undefined;
            }

            if (key === "faculties") {
                return value.map((faculty: Faculty) => faculty.name);
            }

            return value;
        });
    };
}
