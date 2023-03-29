import { LectureType, WeekDay } from "../utils/enums";
import Interval from "../utils/interval";

export default class Slot {
    public credits: number = 0;

    constructor(
        public id: number,
        public name: string,
        public lectureType: LectureType,
        public dayTime: [WeekDay, Interval][]
    ) {
        for (const [, i] of dayTime) {
            this.credits += i.getCredits();
        }
    }

    static isOverlapping = (s1: Slot, s2: Slot) => {
        let ans = false;
        for (const dt1 of s1.dayTime) {
            for (const dt2 of s2.dayTime) {
                if (
                    dt1[0] === dt2[0] &&
                    Interval.isOverlapping(dt1[1], dt2[1])
                ) {
                    ans = true;
                }
            }
        }
        return ans;
    };

    getExpandedSlots = () => {
        const expandedSlots: Slot[] = [];
        this.dayTime.forEach((dayTime, i) => {
            expandedSlots.push(
                new Slot(this.id * 100 + i, this.name, this.lectureType, [
                    [dayTime[0], dayTime[1]],
                ])
            );
        });
        return expandedSlots;
    };

    getTimeOnDay = (day: WeekDay) => {
        const result: Interval[] = [];
        this.dayTime.forEach((dt) => {
            if (dt[0] === day) {
                result.push(dt[1]);
            }
        });
        return result;
    };

    toString = (verbose = true) => {
        const meetings = [];
        for (const meetingTime of this.dayTime) {
            meetings.push(`[${meetingTime[0]}, ${meetingTime[1].toString()}]`);
        }
        return verbose
            ? `<${this.name} (${this.lectureType}, ${
                  this.credits
              }) [${meetings.join(", ")}]>`
            : `<${this.name} (${this.lectureType}, ${this.credits})>`;
    };
}
