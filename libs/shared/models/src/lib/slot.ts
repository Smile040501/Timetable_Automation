import { WeekDay } from "@ta/shared/utils";

import { Interval } from "./interval";

export class Slot {
    public credits = 0;

    constructor(
        public slotID: number,
        public name: string,
        public lectureType: string,
        public dayTime: [WeekDay, Interval][]
    ) {
        for (const [, i] of dayTime) {
            this.credits += Interval.getCredits(i);
        }
    }

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

    static isOverlapping = (s1: Slot, s2: Slot) => {
        let ans = false;
        s1.dayTime.forEach((dt1) => {
            s2.dayTime.forEach((dt2) => {
                if (
                    dt1[0] === dt2[0] &&
                    Interval.isOverlapping(dt1[1], dt2[1])
                ) {
                    ans = true;
                }
            });
        });
        return ans;
    };

    static getExpandedSlots = (s: Slot) => {
        const expandedSlots: Slot[] = [];
        s.dayTime.forEach((dayTime, i) => {
            expandedSlots.push(
                new Slot(s.slotID * 100 + i, s.name, s.lectureType, [
                    [dayTime[0], dayTime[1]],
                ])
            );
        });
        return expandedSlots;
    };

    static getTimeOnDay = (s: Slot, day: WeekDay) => {
        const result: Interval[] = [];
        s.dayTime.forEach((dt) => {
            if (dt[0] === day) {
                result.push(dt[1]);
            }
        });
        return result;
    };

    static exportAsJSON = (slots: Slot[]) => {
        return JSON.stringify(slots, (key, value) => {
            if (key === "slotID" || key === "credits") {
                return undefined;
            }

            if (key === "dayTime") {
                const dayTimes: [WeekDay, Interval][] = [];
                for (const dayTime of value as [WeekDay, Interval][]) {
                    const newDayTime: (
                        | WeekDay
                        | { start: string; end: string }
                    )[] = [];
                    newDayTime.push(dayTime[0]);
                    newDayTime.push({
                        start: `${Interval.getString(
                            dayTime[1].startHours,
                            dayTime[1].startMinutes,
                            Interval.exportOptions
                        )}`,
                        end: `${Interval.getString(
                            dayTime[1].endHours,
                            dayTime[1].endMinutes,
                            Interval.exportOptions
                        )}`,
                    });
                    dayTimes.push(newDayTime as [WeekDay, Interval]);
                }
                return dayTimes;
            }

            return value;
        });
    };
}
