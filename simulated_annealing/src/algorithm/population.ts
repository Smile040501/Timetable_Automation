import Data from "./data";
import Schedule from "./schedule";

export default class Population {
    public schedules: Schedule[] = [];

    constructor(public data: Data, public size: number) {
        for (let i = 0; i < size; ++i) {
            this.schedules.push(new Schedule(this.data).initialize());
        }
    }

    // Sort the schedules in decreasing order of their fitness
    sort = () => {
        this.schedules.sort((s1, s2) => {
            return s1.fitness < s2.fitness ? 1 : -1;
        });
    };
}
