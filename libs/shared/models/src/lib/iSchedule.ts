import { Class } from "./class";

export interface ISchedule {
    classes: Class[];
    fitness: number;
    initialize(): ISchedule;
}
