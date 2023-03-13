import { LectureType } from "../utils/enums";

export default class Room {
    constructor(
        public id: number,
        public name: string,
        public lectureType: LectureType,
        public capacity: number,
        public campus: string
    ) {}

    toString = () =>
        `<${this.name} (${this.campus}, ${this.lectureType}, ${this.capacity})>`;
}
