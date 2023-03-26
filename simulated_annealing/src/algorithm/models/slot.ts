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

    isOverlapping = (s: Slot) => {
        let ans = false;
        this.dayTime.forEach((dt1) => {
            s.dayTime.forEach((dt2) => {
                if (dt1[0] === dt2[0] && dt1[1].isOverlapping(dt2[1])) {
                    ans = true;
                }
            });
        });
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
