import Course from "./models/course";
import Slot from "./models/slot";
import Room from "./models/room";

// Gene for a Chromosome
export default class Class {
    constructor(
        public id: number,
        public course: Course,
        public slots: Slot[] = [],
        public room?: Room
    ) {}

    isOverlapping = (cls: Class) => {
        let ans = false;
        this.slots.forEach((s1) => {
            cls.slots.forEach((s2) => {
                if (s1.isOverlapping(s2)) {
                    ans = true;
                }
            });
        });
        return ans;
    };

    toString = () => {
        return `<${this.course.name},${
            this.room ? this.room.name : ""
        },[${this.slots.map((slot) => slot.name).join(",")}]>`;
    };
}
