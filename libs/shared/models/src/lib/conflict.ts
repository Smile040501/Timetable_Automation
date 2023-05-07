import { ConflictType } from "@ta/shared/utils";

import { Class } from "./class";

export class Conflict {
    constructor(
        public conflictType: ConflictType,
        public conflictingClasses: Class[],
        public otherInfo: string | number = ""
    ) {}

    toString = () =>
        `${this.conflictType} [${this.conflictingClasses
            .map((cls) => cls.toString())
            .join(", ")}]`;
}
