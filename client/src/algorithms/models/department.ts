import Faculty from "./faculty";

export default class Department {
    constructor(
        public deptID: number,
        public name: string,
        public faculties: Faculty[]
    ) {}

    toString = () => this.name;
}
