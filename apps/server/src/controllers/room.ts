import { RequestHandler } from "express";
import mongoose from "mongoose";

import { FetchRoomsResponse } from "@ta/shared/models";
import {
    HttpError,
    httpStatusTypes,
    httpStatusNames,
    RoomAsJSON,
} from "@ta/shared/utils";

import { AuthRequest } from "../utils/interfaces";
import { RoomModel } from "../models";

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
    const { rooms } = req.body;

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        for (let i = 0; i < rooms.length; ++i) {
            const newRoom = new RoomModel({ ...rooms[i] });
            await newRoom.save({ session });
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
