import { Schema, Types, model } from "mongoose";

import { DataUploaded, Departments } from "@ta/shared/utils";

const dataSchema = new Schema<DataUploaded<Types.ObjectId>>(
    {
        rooms: [
            {
                type: Schema.Types.ObjectId,
                ref: "Room",
                required: true,
            },
        ],
        slots: [
            {
                type: Schema.Types.ObjectId,
                ref: "Slot",
                required: true,
            },
        ],
        courses: [
            {
                type: Schema.Types.ObjectId,
                ref: "Course",
                required: true,
            },
        ],
        faculties: {
            type: [String],
            required: true,
        },
        departmentsWithConflicts: [
            {
                type: String,
                enum: Object.values(Departments),
                required: true,
            },
        ],
        departmentsWithNoConflicts: [
            {
                type: String,
                enum: Object.values(Departments),
                required: true,
            },
        ],
        maxSlotCredits: {
            type: Number,
            required: true,
        },
        minSlotCredits: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export default model<DataUploaded<Types.ObjectId>>("Data", dataSchema);
