import { Schema, model } from "mongoose";

import { LectureType, SlotAsUploaded } from "@ta/shared/utils";

const slotSchema = new Schema<SlotAsUploaded>(
    {
        name: {
            type: String,
            unique: true,
            required: true,
        },
        lectureType: {
            type: String,
            enum: Object.values(LectureType),
            required: true,
        },
        dayTime: {
            type: [
                { weekDay: String, interval: { start: String, end: String } },
            ],
            required: true,
        },
    },
    { timestamps: true }
);

export default model<SlotAsUploaded>("Slot", slotSchema);
