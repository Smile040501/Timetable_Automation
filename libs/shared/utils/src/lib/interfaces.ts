/* eslint-disable @typescript-eslint/no-explicit-any */
export type StringifiedValues<T> = {
    [K in keyof T]: string;
};

export interface CourseAsJSON {
    code: string;
    name: string;
    credits: [number, number, number, number];
    courseType: string;
    lectureType: string;
    maxNumberOfStudents: number;
    faculties: string[];
    department: string;
}

export interface RoomAsJSON {
    name: string;
    lectureType: string;
    capacity: number;
    campus: string;
}

export interface SlotAsJSON {
    name: string;
    lectureType: string;
    dayTime: [string, { start: string; end: string }][];
}

export interface SlotAsUploaded {
    name: string;
    lectureType: string;
    dayTime: {
        weekDay: string;
        interval: { start: string; end: string };
    }[];
}

export interface ClassAsReturned {
    course: CourseAsJSON;
    rooms: RoomAsJSON[];
    slots: SlotAsJSON[];
}

export interface DataUploaded<T = null> {
    rooms: (T extends null ? RoomAsJSON : T)[];
    slots: (T extends null ? SlotAsJSON : T)[];
    courses: (T extends null ? CourseAsJSON : T)[];
    faculties: string[];
    departmentsWithConflicts: string[];
    departmentsWithNoConflicts: string[];
    maxSlotCredits: number;
    minSlotCredits: number;
}

export interface AlgorithmConfigData {
    VERBOSE?: boolean;
    RANDOM_DATA?: boolean;
    UPPER_BOUND?: number;
    MIN_NUM_FACULTY?: number;
    NUM_PME?: number;
    EXPANDED_SLOTS?: boolean;
    inputCourses?: CourseAsJSON[];
    inputRooms?: RoomAsJSON[];
    inputSlots?: SlotAsJSON[];
    logFunc?: (log: any) => void;
}

export interface Filters {
    courses: string[];
    rooms: string[];
    faculties: string[];
    slots: string[];
    departments: string[];
    courseTypes: string[];
    lectureTypes: string[];
    campuses: string[];
}

export default interface DocumentType<T> {
    _doc: T;
}
