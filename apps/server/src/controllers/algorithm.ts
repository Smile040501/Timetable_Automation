/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RequestHandler } from "express";

import { FetchAlgorithmDataResponse } from "@ta/shared/models";
import {
    HttpError,
    httpStatusTypes,
    httpStatusNames,
    AlgorithmConfigData,
    AlgorithmStatus,
    convertSlotsUploadedToJSON,
} from "@ta/shared/utils";

import { environment as env } from "../environment";
import { AuthRequest } from "../utils/interfaces";
import {
    ClassModel,
    CourseModel,
    DataModel,
    RoomModel,
    SlotModel,
} from "../models";
import { AlgorithmJobResultData } from "../bullmq/interface";
import { addJobToAlgorithmQueue, algorithmJobName } from "../bullmq/bullmq";
import { getCourseByIds } from "./course";
import { getRoomsByIds } from "./room";
import { getSlotsByIds } from "./slot";
import { algorithmOptions } from "@ta/shared/algorithms";
import {
    getRedisAlgorithmStatus,
    setRedisAlgorithmStatus,
} from "../utils/algorithmStatus";

const defaultAlgorithmConfig: AlgorithmConfigData = {
    VERBOSE: !env.production,
    RANDOM_DATA: false,
    UPPER_BOUND: 10000,
    MIN_NUM_FACULTY: 2,
    NUM_PME: 0,
    EXPANDED_SLOTS: false,
    inputCourses: [],
    inputRooms: [],
    inputSlots: [],
};

export const saveAlgorithmResults = async ({
    algorithmResult,
    courses,
    slots,
    rooms,
}: AlgorithmJobResultData) => {
    const [data, , classes] = algorithmResult;

    await ClassModel.deleteMany({});
    await DataModel.deleteMany({});

    // Upload Classes
    for (let i = 0; i < classes.length; ++i) {
        const newClass = new ClassModel({
            course: courses.find(
                (course) => course.code === classes[i].course.code
            )!._id,
            rooms: classes[i].rooms.map(
                (room) => rooms.find((rm) => rm.name === room.name)!._id
            ),
            slots: classes[i].slots.map(
                (slot) => slots.find((slt) => slt.name === slot.name)!._id
            ),
        });
        await newClass.save();
    }

    // Upload Data
    const newData = new DataModel({
        rooms: rooms.map((room) => room._id),
        slots: slots.map((slot) => slot._id),
        courses: courses.map((course) => course._id),
        faculties: data.faculties.map((fac) => fac.name),
        departmentsWithConflicts: data.departmentsWithConflicts,
        departmentsWithNoConflicts: data.departmentsWithNoConflicts,
        maxSlotCredits: data.maxSlotCredits,
        minSlotCredits: data.minSlotCredits,
    });
    await newData.save();

    // Algorithm Completed
    await setRedisAlgorithmStatus(AlgorithmStatus.COMPLETED);

    console.log(`Algorithm Status: ${AlgorithmStatus.COMPLETED}`);
};

const generateTimetable: RequestHandler = async (
    req: AuthRequest<{ algorithmId: string }>,
    res,
    next
) => {
    const { algorithmId } = req.body;

    try {
        // Check if algorithm already running
        const algorithmStatus = await getRedisAlgorithmStatus();
        if (algorithmStatus && algorithmStatus === AlgorithmStatus.PENDING) {
            const br = httpStatusTypes[httpStatusNames.BAD_REQUEST];
            const error = new HttpError(br.message, br.status);
            return next(error);
        }

        // Check if algorithm option exists
        const algorithmOption = algorithmOptions.find(
            (algo) => algo.id === algorithmId
        );

        if (!algorithmOption) {
            const mta = httpStatusTypes[httpStatusNames.METHOD_NOT_ALLOWED];
            const error = new HttpError(mta.message, mta.status);
            return next(error);
        }

        const uploadedCourses = await CourseModel.find({});
        const uploadedRooms = await RoomModel.find({});
        const uploadedSlots = await SlotModel.find({});

        const courses = uploadedCourses.map((course) =>
            course.toObject({ getters: true })
        );
        const rooms = uploadedRooms.map((room) =>
            room.toObject({ getters: true })
        );
        const slots = uploadedSlots.map((slot) =>
            slot.toObject({ getters: true })
        );

        // If no data is uploaded to the database
        if (courses.length === 0 || rooms.length === 0 || slots.length === 0) {
            const pf = httpStatusTypes[httpStatusNames.PRECONDITION_FAILED];
            const error = new HttpError(pf.message, pf.status);
            return next(error);
        }

        const algorithmConfig: AlgorithmConfigData = {
            ...defaultAlgorithmConfig,
            inputCourses: courses.slice(0, 10),
            inputRooms: rooms,
            inputSlots: slots.map((slot) => convertSlotsUploadedToJSON(slot)),
        };

        await setRedisAlgorithmStatus(AlgorithmStatus.PENDING);

        // Start algorithm execution job
        await addJobToAlgorithmQueue(algorithmJobName, {
            algorithmId,
            algorithmConfig,
            courses,
            rooms,
            slots,
        });

        const ok = httpStatusTypes[httpStatusNames.OK];
        const fetchAlgorithmDataResponse: FetchAlgorithmDataResponse = {
            msg: ok.message,
            algorithmStatus: AlgorithmStatus.PENDING,
            classes: [],
        };
        res.status(ok.status).json(fetchAlgorithmDataResponse);
    } catch (err) {
        const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
        const error = new HttpError(isa.message, isa.status, err);
        return next(error);
    }
};

const getAlgorithmStatus: RequestHandler = async (
    req: AuthRequest<object>,
    res,
    next
) => {
    try {
        const algorithmStatus = await getRedisAlgorithmStatus();
        if (!algorithmStatus) {
            const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
            const error = new HttpError(isa.message, isa.status);
            return next(error);
        }

        const ok = httpStatusTypes[httpStatusNames.OK];
        const fetchAlgorithmDataResponse: FetchAlgorithmDataResponse = {
            msg: ok.message,
            algorithmStatus: algorithmStatus as AlgorithmStatus,
            classes: [],
        };

        res.status(ok.status).json(fetchAlgorithmDataResponse);
    } catch (err) {
        const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
        const error = new HttpError(isa.message, isa.status, err);
        return next(error);
    }
};

const getClasses = async () => {
    const uploadedClasses = await ClassModel.find({});
    const classesObjects = uploadedClasses.map((cls) =>
        cls.toObject({ getters: true })
    );

    const classes = [];
    for (let i = 0; i < classesObjects.length; ++i) {
        const classObj = classesObjects[i];
        const courses = await getCourseByIds([classObj.course]);
        const rooms = await getRoomsByIds(classObj.rooms);
        const slots = await getSlotsByIds(classObj.slots);
        classes.push({ course: courses[0], rooms, slots });
    }

    return classes;
};

const getData = async () => {
    const dataArray = await DataModel.find({});
    const uploadedData = dataArray[0].toObject({ getters: true });

    const courses = await getCourseByIds(uploadedData.courses);
    const rooms = await getRoomsByIds(uploadedData.rooms);
    const slots = await getSlotsByIds(uploadedData.slots);

    return { ...uploadedData, courses, rooms, slots };
};

const getTimetableData: RequestHandler = async (
    req: AuthRequest<object>,
    res,
    next
) => {
    try {
        const algorithmStatus = await getRedisAlgorithmStatus();
        if (!algorithmStatus) {
            const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
            const error = new HttpError(isa.message, isa.status);
            return next(error);
        }

        const ok = httpStatusTypes[httpStatusNames.OK];

        if (
            algorithmStatus === AlgorithmStatus.PENDING ||
            algorithmStatus === AlgorithmStatus.UNEXECUTED
        ) {
            const fetchAlgorithmDataResponse: FetchAlgorithmDataResponse = {
                msg: ok.message,
                algorithmStatus: algorithmStatus,
                classes: [],
            };

            return res.status(ok.status).json(fetchAlgorithmDataResponse);
        }

        const classes = await getClasses();
        const data = await getData();

        const fetchAlgorithmDataResponse: FetchAlgorithmDataResponse = {
            msg: ok.message,
            algorithmStatus: AlgorithmStatus.COMPLETED,
            classes: classes.map((cls) => ({
                ...cls,
                slots: cls.slots.map((slot) =>
                    convertSlotsUploadedToJSON(slot)
                ),
            })),
            data: {
                ...data,
                slots: data.slots.map((slot) =>
                    convertSlotsUploadedToJSON(slot)
                ),
            },
        };

        res.status(ok.status).json(fetchAlgorithmDataResponse);
    } catch (err) {
        const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
        const error = new HttpError(isa.message, isa.status, err);
        return next(error);
    }
};

export default { getAlgorithmStatus, getTimetableData, generateTimetable };
