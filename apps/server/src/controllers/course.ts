import { RequestHandler } from "express";
import mongoose from "mongoose";

import { FetchCoursesResponse } from "@ta/shared/models";
import {
    HttpError,
    httpStatusTypes,
    httpStatusNames,
    CourseAsJSON,
} from "@ta/shared/utils";

import { AuthRequest } from "../utils/interfaces";
import { CourseModel } from "../models";

const getCourses: RequestHandler = async (
    req: AuthRequest<object>,
    res,
    next
) => {
    try {
        const courses = await CourseModel.find({});

        const ok = httpStatusTypes[httpStatusNames.OK];
        const fetchCourseResponse: FetchCoursesResponse = {
            courses: courses.map((course) =>
                course.toObject({ getters: true })
            ),
            msg: ok.message,
        };
        res.status(ok.status).json(fetchCourseResponse);
    } catch (err) {
        const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
        const error = new HttpError(isa.message, isa.status, err);
        return next(error);
    }
};

const uploadCourses: RequestHandler = async (
    req: AuthRequest<{ courses: CourseAsJSON[] }>,
    res,
    next
) => {
    const { courses } = req.body;

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        for (let i = 0; i < courses.length; ++i) {
            const newCourse = new CourseModel({ ...courses[i] });
            await newCourse.save({ session });
        }

        await session.commitTransaction();
    } catch (err) {
        const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
        const error = new HttpError(isa.message, isa.status, err);
        return next(error);
    }

    const ok = httpStatusTypes[httpStatusNames.OK];
    res.status(ok.status).json({ msg: ok.message });
};

export default { getCourses, uploadCourses };
