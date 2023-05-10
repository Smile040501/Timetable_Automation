import { Schema, model } from "mongoose";

import { LectureType, SlotAsJSON } from "@ta/shared/utils";

const slotSchema = new Schema<SlotAsJSON>(
    {
        name: {
            type: String,
            required: true,
        },
        lectureType: {
            type: String,
            enum: Object.values(LectureType),
            required: true,
        },
        dayTime: {
            type: [String, { start: String, end: String }],
            validate: [
                (arr: (string | { start: string; end: string })[]) => {
                    return (
                        arr.length === 2 &&
                        typeof arr[0] === "string" &&
                        typeof arr[1] === "object" &&
                        arr[1].start &&
                        arr[1].end
                    );
                },
                "{PATH} should be a tuple array of form [WeekDay, {start: string, end: string}]",
            ],
            required: true,
        },
    },
    { timestamps: true }
);

export default model<SlotAsJSON>("Slot", slotSchema);
