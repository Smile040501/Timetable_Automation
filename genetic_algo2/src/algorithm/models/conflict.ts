import Class from "../class";
import { ConflictType } from "../utils/enums";

export default class Conflict {
    constructor(
        public conflictType: ConflictType,
        public conflictingClasses: Class[],
        public otherInfo: string = ""
    ) {}

    toString = () =>
        `${this.conflictType} [${this.conflictingClasses
            .map((cls) => cls.toString())
            .join(", ")}]`;
}
