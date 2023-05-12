import { RequestHandler } from "express";
import mongoose from "mongoose";

import { FetchSlotsResponse } from "@ta/shared/models";
import {
    HttpError,
    httpStatusTypes,
    httpStatusNames,
    SlotAsUploaded,
} from "@ta/shared/utils";

import { AuthRequest } from "../utils/interfaces";
import { SlotModel } from "../models";

const getSlots: RequestHandler = async (
    req: AuthRequest<object>,
    res,
    next
) => {
    try {
        const slots = await SlotModel.find({});

        const ok = httpStatusTypes[httpStatusNames.OK];
        const fetchSlotsResponse: FetchSlotsResponse = {
            slots: slots.map((slot) => slot.toObject({ getters: true })),
            msg: ok.message,
        };
        res.status(ok.status).json(fetchSlotsResponse);
    } catch (err) {
        const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
        const error = new HttpError(isa.message, isa.status, err);
        return next(error);
    }
};

const uploadSlots: RequestHandler = async (
    req: AuthRequest<{ slots: SlotAsUploaded[] }>,
    res,
    next
) => {
    const { slots } = req.body;

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        await SlotModel.deleteMany({});

        for (let i = 0; i < slots.length; ++i) {
            await SlotModel.findOneAndUpdate(
                { name: slots[i].name },
                slots[i],
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

export default { getSlots, uploadSlots };
