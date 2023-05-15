import { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";

import {
    FetchCoursesResponse,
    MongooseReturnedObject,
} from "@ta/shared/models";
import {
    HttpError,
    httpStatusTypes,
    httpStatusNames,
    CourseAsJSON,
    AlgorithmStatus,
} from "@ta/shared/utils";

import { AuthRequest } from "../utils/interfaces";
import { CourseModel } from "../models";
import { getRedisAlgorithmStatus } from "../utils/algorithmStatus";

export const getCourseByIds = async (courseIds: Types.ObjectId[]) => {
    const courses: MongooseReturnedObject<CourseAsJSON>[] = [];
    for (let i = 0; i < courseIds.length; ++i) {
        const uploadedCourse = await CourseModel.findById(courseIds[i]);
        if (!uploadedCourse) {
            const nf = httpStatusTypes[httpStatusNames.NOT_FOUND];
            const error = new HttpError(nf.message, nf.status);
            throw error;
        }
        const course = uploadedCourse.toObject();
        courses.push(course);
    }
    return courses;
};

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
    // Check if algorithm already running
    const algorithmStatus = await getRedisAlgorithmStatus();
    if (algorithmStatus && algorithmStatus === AlgorithmStatus.PENDING) {
        const br = httpStatusTypes[httpStatusNames.BAD_REQUEST];
        const error = new HttpError(br.message, br.status);
        return next(error);
    }

    const { courses } = req.body;

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        await CourseModel.deleteMany({}, { session });

        for (let i = 0; i < courses.length; ++i) {
            await CourseModel.findOneAndUpdate(
                { code: courses[i].code },
                courses[i],
                {
                    new: true,
                    upsert: true,
                    session,
                }
            );
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
