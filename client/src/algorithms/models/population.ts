import Data from "./data";
import ISchedule from "./iSchedule";

export default class Population {
    public schedules: ISchedule[] = [];

    constructor(
        public data: Data,
        public size: number,
        Schedule: new (data: Data) => ISchedule
    ) {
        for (let i = 0; i < size; ++i) {
            this.schedules.push(new Schedule(this.data).initialize());
        }
    }

    // Sort the schedules in decreasing order of their fitness
    static sort = (schedules: ISchedule[]) => {
        schedules.sort((s1, s2) => {
            return s1.fitness < s2.fitness ? 1 : -1;
        });
    };
}
