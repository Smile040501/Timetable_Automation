import { expandObject, getBiasedArray } from "./utils/utils";
import Room from "./models/room";
import { CourseType, Departments, LectureType, WeekDay } from "./utils/enums";
import Faculty from "./models/faculty";
import Course from "./models/course";
import Slot from "./models/slot";
import Interval from "./utils/interval";
import Department from "./models/department";

const departmentDist: {
    [prop: string]: {
        numFaculty: number;
        courses: {
            [prop: string]: {
                num: number;
                credits: number[];
            };
        };
    };
} = expandObject({
    [`${Departments.CSE}, ${Departments.EE}`]: {
        numFaculty: 2,
        courses: {
            [CourseType.PMT]: {
                num: 2,
                credits: [3, 4, 5],
            },
            [CourseType.PMP]: {
                num: 2,
                credits: [3],
            },
            [CourseType.PME]: {
                num: 1,
                credits: [3, 4, 5],
            },
            [CourseType.OE]: {
                num: 0,
                credits: [3, 4, 5],
            },
        },
    },
    [`${Departments.ME}, ${Departments.CE}`]: {
        numFaculty: 2,
        courses: {
            [CourseType.PMT]: {
                num: 2,
                credits: [3, 4, 5],
            },
            [CourseType.PMP]: {
                num: 2,
                credits: [3],
            },
            [CourseType.PME]: {
                num: 1,
                credits: [3, 4, 5],
            },
            [CourseType.OE]: {
                num: 0,
                credits: [3, 4, 5],
            },
        },
    },
    [Departments.GCE]: {
        numFaculty: 5,
        courses: {
            [CourseType.GCE]: {
                num: 5,
                credits: [3],
            },
        },
    },
    [Departments.SME]: {
        numFaculty: 5,
        courses: {
            [CourseType.SME]: {
                num: 5,
                credits: [3],
            },
        },
    },
    [Departments.HSE]: {
        numFaculty: 5,
        courses: {
            [CourseType.HSE]: {
                num: 5,
                credits: [3],
            },
        },
    },
});
const NUM_ROOMS = 30;
const campuses = ["Nila", "Ahalia"];
const roomCapacity = [45, 60, 100];
const studentCapacity = [25, 35, 45, 60, 100];
const lectureTypes = getBiasedArray(
    [LectureType.Normal, LectureType.Lab],
    [9, 1]
);

const generateRooms = (numRooms: number) => {
    const rooms: Room[] = [];
    for (let i = 1; i <= numRooms; ++i) {
        const lectureType = lectureTypes[
            i % lectureTypes.length
        ] as LectureType;
        rooms.push(
            new Room(
                i,
                `R${i}`,
                lectureType,
                lectureType === LectureType.Lab
                    ? roomCapacity[roomCapacity.length - 1]
                    : roomCapacity[i % roomCapacity.length],
                campuses[i % campuses.length]
            )
        );
    }
    return rooms;
};

const generateDepartments = () => {
    const departments: { [prop: string]: Department } = {};
    Object.keys(departmentDist).forEach((dept, i) => {
        const faculties: Faculty[] = [];
        for (let j = 1; j <= departmentDist[dept].numFaculty; ++j) {
            faculties.push(new Faculty(i * 100 + j, `F${i}${j}`));
        }
        departments[dept] = new Department(i, dept, faculties);
    });
    return departments;
};

const generateCourses = (departments: { [prop: string]: Department }) => {
    const courses: Course[] = [];
    let courseCode = 1;
    Object.keys(departmentDist).forEach((dept) => {
        let facIdx = 0;
        const faculties = departments[dept].faculties;
        Object.keys(departmentDist[dept].courses).forEach((courseType) => {
            const courseDist = departmentDist[dept].courses[courseType];
            for (let i = 1; i <= courseDist.num; ++i) {
                courses.push(
                    new Course(
                        courseCode,
                        `C${courseCode}`,
                        `C${courseCode}`,
                        [
                            1,
                            1,
                            1,
                            courseDist.credits[i % courseDist.credits.length],
                        ],
                        courseType as CourseType,
                        courseType === CourseType.PMP
                            ? LectureType.Lab
                            : LectureType.Normal,
                        courseType === CourseType.PMP
                            ? studentCapacity[studentCapacity.length - 1]
                            : studentCapacity[i % studentCapacity.length],
                        i % 9 === 0
                            ? [
                                  faculties[facIdx % faculties.length],
                                  faculties[(facIdx + 1) % faculties.length],
                              ]
                            : [faculties[facIdx % faculties.length]],
                        dept as Departments
                    )
                );
                ++facIdx;
                ++courseCode;
            }
        });
    });
    // 2 Project courses -> No Faculty / Slot
    for (let i = 0; i < 2; ++i) {
        courses.push(
            new Course(
                courseCode,
                `C${courseCode}`,
                `C${courseCode}`,
                [1, 1, 1, 3],
                CourseType.PROJECT,
                LectureType.Normal,
                studentCapacity[studentCapacity.length - 1],
                [],
                Departments.GENERAL,
                false
            )
        );
        ++courseCode;
    }
    // 4 COMMON Courses -> Any Faculty, Multiple Faculty
    let deptIdx = 0;
    let factIdx = 0;
    for (let i = 0; i < 4; ++i) {
        const faculties: Faculty[] = [];
        for (let j = 0; j < 3; ++j) {
            const faclts =
                Object.values(departments)[
                    deptIdx % Object.values(departments).length
                ].faculties;
            faculties.push(faclts[factIdx % faclts.length]);
            ++deptIdx;
        }
        courses.push(
            new Course(
                courseCode,
                `C${courseCode}`,
                `C${courseCode}`,
                [1, 1, 1, 3],
                CourseType.COMMON,
                LectureType.Normal,
                studentCapacity[studentCapacity.length - 1],
                faculties,
                Departments.GENERAL
            )
        );
        ++courseCode;
        ++factIdx;
    }
    return courses;
};

const generateSlots = () => [
    new Slot(1, "B1", LectureType.Normal, [
        [WeekDay.Monday, new Interval("08:00", "08:50")],
    ]),
    new Slot(2, "A", LectureType.Normal, [
        [WeekDay.Monday, new Interval("09:00", "09:50")],
        [WeekDay.Tuesday, new Interval("17:00", "17:50")],
        [WeekDay.Wednesday, new Interval("09:00", "09:50")],
    ]),
    new Slot(3, "H", LectureType.Normal, [
        [WeekDay.Monday, new Interval("10:00", "10:50")],
        [WeekDay.Wednesday, new Interval("11:00", "11:50")],
        [WeekDay.Friday, new Interval("08:00", "08:50")],
    ]),
    new Slot(4, "D", LectureType.Normal, [
        [WeekDay.Monday, new Interval("11:00", "11:50")],
        [WeekDay.Wednesday, new Interval("17:00", "17:50")],
        [WeekDay.Friday, new Interval("10:00", "10:50")],
    ]),
    new Slot(5, "E", LectureType.Normal, [
        [WeekDay.Monday, new Interval("12:00", "12:50")],
        [WeekDay.Wednesday, new Interval("12:00", "12:50")],
        [WeekDay.Friday, new Interval("12:00", "12:50")],
    ]),
    new Slot(6, "L", LectureType.Normal, [
        [WeekDay.Monday, new Interval("14:00", "15:15")],
        [WeekDay.Friday, new Interval("15:30", "16:45")],
    ]),
    new Slot(7, "K", LectureType.Normal, [
        [WeekDay.Monday, new Interval("15:30", "16:45")],
        [WeekDay.Friday, new Interval("14:00", "15:15")],
    ]),
    new Slot(8, "C", LectureType.Normal, [
        [WeekDay.Monday, new Interval("17:00", "17:50")],
        [WeekDay.Wednesday, new Interval("08:00", "08:50")],
        [WeekDay.Friday, new Interval("09:00", "09:50")],
    ]),
    new Slot(9, "P1", LectureType.Lab, [
        [WeekDay.Monday, new Interval("10:00", "12:50")],
    ]),
    new Slot(10, "P4", LectureType.Lab, [
        [WeekDay.Monday, new Interval("14:00", "16:45")],
    ]),
    new Slot(11, "D1", LectureType.Normal, [
        [WeekDay.Tuesday, new Interval("08:00", "08:50")],
    ]),
    new Slot(12, "F", LectureType.Normal, [
        [WeekDay.Tuesday, new Interval("09:00", "10:15")],
        [WeekDay.Thursday, new Interval("09:00", "10:15")],
        [WeekDay.Friday, new Interval("17:00", "17:50")],
    ]),
    new Slot(13, "G", LectureType.Normal, [
        [WeekDay.Tuesday, new Interval("10:30", "11:45")],
        [WeekDay.Thursday, new Interval("10:30", "11:45")],
    ]),
    new Slot(14, "M", LectureType.Normal, [
        [WeekDay.Tuesday, new Interval("12:00", "12:50")],
        [WeekDay.Thursday, new Interval("12:00", "12:50")],
    ]),
    new Slot(15, "I", LectureType.Normal, [
        [WeekDay.Tuesday, new Interval("14:00", "15:15")],
        [WeekDay.Thursday, new Interval("15:30", "16:45")],
    ]),
    new Slot(16, "J", LectureType.Normal, [
        [WeekDay.Tuesday, new Interval("15:30", "16:45")],
        [WeekDay.Thursday, new Interval("14:00", "15:15")],
    ]),
    new Slot(17, "P5", LectureType.Lab, [
        [WeekDay.Tuesday, new Interval("14:00", "16:45")],
    ]),
    new Slot(18, "B", LectureType.Normal, [
        [WeekDay.Wednesday, new Interval("10:00", "10:50")],
        [WeekDay.Thursday, new Interval("17:00", "17:50")],
        [WeekDay.Friday, new Interval("11:00", "11:50")],
    ]),
    new Slot(19, "C1", LectureType.Normal, [
        [WeekDay.Wednesday, new Interval("14:00", "14:50")],
    ]),
    new Slot(20, "P2", LectureType.Lab, [
        [WeekDay.Wednesday, new Interval("10:00", "12:50")],
    ]),
    new Slot(21, "A1", LectureType.Normal, [
        [WeekDay.Thursday, new Interval("08:00", "08:50")],
    ]),
    new Slot(22, "P6", LectureType.Lab, [
        [WeekDay.Thursday, new Interval("14:00", "16:45")],
    ]),
    new Slot(23, "P3", LectureType.Lab, [
        [WeekDay.Friday, new Interval("10:00", "12:50")],
    ]),
    new Slot(24, "P7", LectureType.Lab, [
        [WeekDay.Friday, new Interval("14:00", "16:45")],
    ]),
];

export default class Data {
    public rooms: Room[];
    public slots: Slot[];
    public courses: Course[];
    public departments: { [prop: string]: Department };
    public departmentsWithConflicts: Departments[];
    public departmentsWithNoConflicts: Departments[];

    constructor() {
        this.rooms = generateRooms(NUM_ROOMS);
        this.slots = generateSlots();
        this.departments = generateDepartments();
        this.courses = generateCourses(this.departments);
        this.departmentsWithConflicts = [
            Departments.CSE,
            Departments.EE,
            Departments.ME,
            Departments.CE,
            Departments.GENERAL,
        ];
        this.departmentsWithNoConflicts = [
            Departments.GCE,
            Departments.HSE,
            Departments.SME,
        ];
    }
}
