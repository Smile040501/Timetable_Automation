import Class from "./class";

export default interface ISchedule {
    classes: Class[];
    fitness: number;
    initialize(): ISchedule;
}
