import { Schema, Types, model } from "mongoose";

import { Class } from "@ta/shared/models";

const classSchema = new Schema<Class<Types.ObjectId>>(
    {
        course: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
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
    },
    { timestamps: true }
);

export default model<Class<Types.ObjectId>>("Class", classSchema);
