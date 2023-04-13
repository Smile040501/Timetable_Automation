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

export interface RoomsAsJSON {
    name: string;
    lectureType: string;
    capacity: number;
    campus: string;
}

export interface SlotsAsJSON {
    name: string;
    lectureType: string;
    dayTime: [string, { start: string; end: string }][];
}
