export class Room {
    constructor(
        public roomID: number,
        public name: string,
        public lectureType: string,
        public capacity: number,
        public campus: string,
        public location: string = ""
    ) {}

    toString = () =>
        `<${this.name} (${this.campus}, ${this.lectureType}, ${this.capacity})>`;

    static exportAsJSON = (rooms: Room[]) => {
        return JSON.stringify(rooms, (key, value) => {
            if (key === "roomID" || (key === "location" && value === "")) {
                return undefined;
            }

            return value;
        });
    };
}
