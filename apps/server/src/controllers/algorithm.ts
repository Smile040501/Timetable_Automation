/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RequestHandler } from "express";
import mongoose from "mongoose";

import { FetchAlgorithmDataResponse } from "@ta/shared/models";
import {
    HttpError,
    httpStatusTypes,
    httpStatusNames,
    AlgorithmConfigData,
    AlgorithmStatus,
    CourseAsJSON,
    RoomAsJSON,
    SlotAsJSON,
    convertSlotsUploadedToJSON,
} from "@ta/shared/utils";
import { executeGen1, executeGen2, executeSA } from "@ta/shared/algorithms";

import { environment as env } from "../environment";
import { AuthRequest } from "../utils/interfaces";
import {
    ClassModel,
    CourseModel,
    DataModel,
    RoomModel,
    SlotModel,
} from "../models";
import redisClient from "../utils/redisConnect";

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

const algorithms = [
    {
        id: "executeGen1",
        algorithm: executeGen1,
    },
    {
        id: "executeGen2",
        algorithm: executeGen2,
    },
    {
        id: "executeSA",
        algorithm: executeSA,
    },
];

const generateTimetable: RequestHandler = async (
    req: AuthRequest<{ algorithmId: string }>,
    res,
    next
) => {
    const { algorithmId } = req.body;

    try {
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

        const algorithmConfig: AlgorithmConfigData = {
            ...defaultAlgorithmConfig,
            inputCourses: courses.slice(0, 30),
            inputRooms: rooms,
            inputSlots: slots.map((slot) => convertSlotsUploadedToJSON(slot)),
        };

        const algorithmOption = algorithms.find(
            (algo) => algo.id === algorithmId
        );

        if (
            !algorithmOption ||
            courses.length === 0 ||
            rooms.length === 0 ||
            slots.length === 0
        ) {
            const mta = httpStatusTypes[httpStatusNames.METHOD_NOT_ALLOWED];
            const error = new HttpError(mta.message, mta.status);
            return next(error);
        }

        if (!redisClient.isOpen) {
            await redisClient.connect();
        }

        const algorithmStatus = await redisClient.get(env.algorithmStatus!);
        if (algorithmStatus && algorithmStatus === AlgorithmStatus.PENDING) {
            const mta = httpStatusTypes[httpStatusNames.METHOD_NOT_ALLOWED];
            const error = new HttpError(mta.message, mta.status);
            return next(error);
        }

        await redisClient.set(env.algorithmStatus!, AlgorithmStatus.PENDING);

        const ok = httpStatusTypes[httpStatusNames.OK];
        const fetchAlgorithmDataResponse: FetchAlgorithmDataResponse = {
            msg: ok.message,
            algorithmStatus: AlgorithmStatus.PENDING,
            classes: [],
        };

        res.status(ok.status).json(fetchAlgorithmDataResponse);

        (async () => {
            const [data, , classes] = await algorithmOption.algorithm(
                algorithmConfig
            );

            const session = await mongoose.startSession();
            session.startTransaction();

            await ClassModel.deleteMany({}, { session });
            await DataModel.deleteMany({}, { session });

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
                        (slot) =>
                            slots.find((slt) => slt.name === slot.name)!._id
                    ),
                });
                await newClass.save({ session });
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
            await newData.save({ session });

            // Algorithm Completed
            if (!redisClient.isOpen) {
                await redisClient.connect();
            }
            await redisClient.set(
                env.algorithmStatus!,
                AlgorithmStatus.COMPLETED
            );

            console.log(AlgorithmStatus.COMPLETED);
            await session.commitTransaction();
        })();
    } catch (err) {
        const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
        const error = new HttpError(isa.message, isa.status, err);
        return next(error);
    }
};

const getTimetableData: RequestHandler = async (
    req: AuthRequest<object>,
    res,
    next
) => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        const algorithmStatus = (await redisClient.get(
            env.algorithmStatus!
        )) as AlgorithmStatus;

        const ok = httpStatusTypes[httpStatusNames.OK];

        if (algorithmStatus === AlgorithmStatus.PENDING) {
            const fetchAlgorithmDataResponse: FetchAlgorithmDataResponse = {
                msg: ok.message,
                algorithmStatus: algorithmStatus,
                classes: [],
            };

            return res.status(ok.status).json(fetchAlgorithmDataResponse);
        }

        const classes = await ClassModel.find({}).populate<{
            course: CourseAsJSON;
            rooms: RoomAsJSON[];
            slots: SlotAsJSON[];
        }>(["course", "rooms", "slots"]);
    } catch (err) {
        const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
        const error = new HttpError(isa.message, isa.status, err);
        return next(error);
    }
};

export default { getTimetableData, generateTimetable };
