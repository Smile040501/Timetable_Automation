import { Schema, model } from "mongoose";

import {
    CourseAsJSON,
    CourseType,
    Departments,
    LectureType,
} from "@ta/shared/utils";

const courseSchema = new Schema<CourseAsJSON>(
    {
        code: {
            type: String,
            unique: true,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        credits: {
            type: [Number],
            validate: [
                (arr: number[]) => {
                    return arr.length === 4;
                },
                "{PATH} should be in the L-T-P-C format.",
            ],
            required: true,
        },
        courseType: {
            type: String,
            enum: Object.values(CourseType),
            required: true,
        },
        lectureType: {
            type: String,
            enum: Object.values(LectureType),
            required: true,
        },
        maxNumberOfStudents: {
            type: Number,
            required: true,
        },
        faculties: {
            type: [String],
            required: true,
        },
        department: {
            type: String,
            enum: Object.values(Departments),
            required: true,
        },
    },
    { timestamps: true }
);

export default model<CourseAsJSON>("Course", courseSchema);
