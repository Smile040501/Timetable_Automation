export default class Faculty {
    constructor(public facultyID: number, public name: string) {}

    toString = () => this.name;

    static exportAsJSON = (faculties: Faculty[]) => {
        return JSON.stringify(faculties);
    };
}
