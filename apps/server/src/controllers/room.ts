import { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";

import { FetchRoomsResponse, MongooseReturnedObject } from "@ta/shared/models";
import {
    HttpError,
    httpStatusTypes,
    httpStatusNames,
    RoomAsJSON,
    AlgorithmStatus,
} from "@ta/shared/utils";

import { AuthRequest } from "../utils/interfaces";
import { RoomModel } from "../models";
import { getRedisAlgorithmStatus } from "../utils/algorithmStatus";

export const getRoomsByIds = async (roomIds: Types.ObjectId[]) => {
    const rooms: MongooseReturnedObject<RoomAsJSON>[] = [];
    for (let i = 0; i < roomIds.length; ++i) {
        const uploadedRoom = await RoomModel.findById(roomIds[i]);
        if (!uploadedRoom) {
            const nf = httpStatusTypes[httpStatusNames.NOT_FOUND];
            const error = new HttpError(nf.message, nf.status);
            throw error;
        }
        const room = uploadedRoom.toObject();
        rooms.push(room);
    }
    return rooms;
};

const getRooms: RequestHandler = async (
    req: AuthRequest<object>,
    res,
    next
) => {
    try {
        const rooms = await RoomModel.find({});

        const ok = httpStatusTypes[httpStatusNames.OK];
        const fetchRoomsResponse: FetchRoomsResponse = {
            rooms: rooms.map((room) => room.toObject({ getters: true })),
            msg: ok.message,
        };
        res.status(ok.status).json(fetchRoomsResponse);
    } catch (err) {
        const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
        const error = new HttpError(isa.message, isa.status, err);
        return next(error);
    }
};

const uploadRooms: RequestHandler = async (
    req: AuthRequest<{ rooms: RoomAsJSON[] }>,
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

    const { rooms } = req.body;

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        await RoomModel.deleteMany({}, { session });

        for (let i = 0; i < rooms.length; ++i) {
            await RoomModel.findOneAndUpdate(
                { name: rooms[i].name },
                rooms[i],
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

export default { getRooms, uploadRooms };
