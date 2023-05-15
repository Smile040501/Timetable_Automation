import { RequestHandler } from "express";
import mongoose, { Types } from "mongoose";

import { FetchSlotsResponse, MongooseReturnedObject } from "@ta/shared/models";
import {
    HttpError,
    httpStatusTypes,
    httpStatusNames,
    SlotAsUploaded,
    AlgorithmStatus,
} from "@ta/shared/utils";

import { AuthRequest } from "../utils/interfaces";
import { SlotModel } from "../models";
import { getRedisAlgorithmStatus } from "../utils/algorithmStatus";

export const getSlotsByIds = async (slotIds: Types.ObjectId[]) => {
    const slots: MongooseReturnedObject<SlotAsUploaded>[] = [];
    for (let i = 0; i < slotIds.length; ++i) {
        const uploadedSlot = await SlotModel.findById(slotIds[i]);
        if (!uploadedSlot) {
            const nf = httpStatusTypes[httpStatusNames.NOT_FOUND];
            const error = new HttpError(nf.message, nf.status);
            throw error;
        }
        const slot = uploadedSlot.toObject();
        slots.push(slot);
    }
    return slots;
};

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
    // Check if algorithm already running
    const algorithmStatus = await getRedisAlgorithmStatus();
    if (algorithmStatus && algorithmStatus === AlgorithmStatus.PENDING) {
        const br = httpStatusTypes[httpStatusNames.BAD_REQUEST];
        const error = new HttpError(br.message, br.status);
        return next(error);
    }

    const { slots } = req.body;

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        await SlotModel.deleteMany({}, { session });

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
