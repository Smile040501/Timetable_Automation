import { Schema, model } from "mongoose";

import { LectureType, RoomAsJSON } from "@ta/shared/utils";

const roomSchema = new Schema<RoomAsJSON>(
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
        capacity: {
            type: Number,
            required: true,
        },
        campus: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default model<RoomAsJSON>("Room", roomSchema);
