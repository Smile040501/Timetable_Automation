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

        return `${startDateStr} - ${endDateStr}`;
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

    isOverlapping = (i: Interval) => {
        const [currentTotalStartMins, currentTotalEndMins] =
            Interval.getMinutes(this);
        const [totalStartMins, totalEndMins] = Interval.getMinutes(i);

        return !(
            currentTotalEndMins < totalStartMins ||
            totalEndMins < currentTotalStartMins
        );
    };

    isBefore = (i: Interval) => {
        if (this.startHours < i.startHours) {
            return true;
        } else if (this.startHours === i.startHours) {
            return this.startMinutes <= i.startMinutes;
        } else {
            return false;
        }
    };

    doesStartsSame = (i: Interval) => {
        return (
            this.startHours === i.startHours &&
            this.startMinutes === i.startMinutes
        );
    };

    getGap = (i: Interval) => {
        const [currTotalStartMinutes, currTotalEndMinutes] =
            Interval.getMinutes(this);
        const [totalStartMinutes, totalEndMinutes] = Interval.getMinutes(i);
        if (this.isBefore(i)) {
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
