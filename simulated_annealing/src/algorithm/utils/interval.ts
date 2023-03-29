export default class Interval {
    private startHours: number;
    private startMinutes: number;
    private endHours: number;
    private endMinutes: number;

    private static options = { hour: "2-digit", minute: "2-digit" } as const;

    constructor(start: string, end: string) {
        [this.startHours, this.startMinutes] = start
            .split(":")
            .map((t) => Number.parseInt(t));
        [this.endHours, this.endMinutes] = end
            .split(":")
            .map((t) => Number.parseInt(t));

        this.validate();
    }

    toString = () => {
        const startDate = new Date(1, 1, 1, this.startHours, this.startMinutes);
        const endDate = new Date(1, 1, 1, this.endHours, this.endMinutes);

        const startDateStr = new Intl.DateTimeFormat(
            navigator.language,
            Interval.options
        ).format(startDate);
        const endDateStr = new Intl.DateTimeFormat(
            navigator.language,
            Interval.options
        ).format(endDate);

        return `${startDateStr} -\n${endDateStr}`;
    };

    static getMinutes = (i: Interval): [number, number] => {
        return [
            i.startHours * 60 + i.startMinutes,
            i.endHours * 60 + i.endMinutes,
        ];
    };

    validate = () => {
        if (
            this.startHours <= 0 ||
            this.startHours > 24 ||
            this.endHours <= 0 ||
            this.endHours > 24
        ) {
            console.error(`Invalid start or end hours! ${this.toString()}`);
        }

        if (
            this.startMinutes < 0 ||
            this.startMinutes > 60 ||
            this.endMinutes < 0 ||
            this.endMinutes > 60
        ) {
            console.error(`Invalid start or end hours! ${this.toString()}`);
        }

        const [totalStartMins, totalEndMins] = Interval.getMinutes(this);
        if (totalEndMins < totalStartMins) {
            console.error(
                `End time should be greater than the start time! ${this.toString()}`
            );
        }
    };

    static isOverlapping = (i1: Interval, i2: Interval) => {
        const [currentTotalStartMins, currentTotalEndMins] =
            Interval.getMinutes(i1);
        const [totalStartMins, totalEndMins] = Interval.getMinutes(i2);

        return !(
            currentTotalEndMins < totalStartMins ||
            totalEndMins < currentTotalStartMins
        );
    };

    static isBefore = (i1: Interval, i2: Interval) => {
        if (i1.startHours < i2.startHours) {
            return true;
        } else if (i1.startHours === i2.startHours) {
            return i1.startMinutes <= i2.startMinutes;
        } else {
            return false;
        }
    };

    static doesStartsSame = (i1: Interval, i2: Interval) => {
        return (
            i1.startHours === i2.startHours &&
            i1.startMinutes === i2.startMinutes
        );
    };

    static getGap = (i1: Interval, i2: Interval) => {
        const [currTotalStartMinutes, currTotalEndMinutes] =
            Interval.getMinutes(i1);
        const [totalStartMinutes, totalEndMinutes] = Interval.getMinutes(i2);
        if (Interval.isBefore(i1, i2)) {
            return totalStartMinutes - currTotalEndMinutes;
        }
        return currTotalStartMinutes - totalEndMinutes;
    };

    getCredits = () => {
        const [totalStartMins, totalEndMins] = Interval.getMinutes(this);
        const duration = totalEndMins - totalStartMins;
        const remainingDuration = duration % 60;
        let credits = 0;
        credits += Math.floor(duration / 60);
        if (remainingDuration <= 30) {
            credits += 0.5;
        } else {
            credits += 1.0;
        }
        return credits;
    };
}
