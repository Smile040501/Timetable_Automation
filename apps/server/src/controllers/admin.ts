/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from "express";

import { CreateUserResponse } from "@ta/shared/models";
import {
    HttpError,
    httpStatusTypes,
    httpStatusNames,
    UserRole,
} from "@ta/shared/utils";

import UserModel from "../models/user";
import { AuthRequest } from "../utils/interfaces";

const createUser: RequestHandler = async (
    req: AuthRequest<{ name: string; email: string; roles: UserRole[] }>,
    res,
    next
) => {
    const { name, email, roles } = req.body;
    const newUser = new UserModel({ name, email, roles });

    try {
        await newUser.save();
    } catch (err) {
        const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
        const error = new HttpError(isa.message, isa.status, err);
        return next(error);
    }

    const created = httpStatusTypes[httpStatusNames.CREATED];
    const createUserResponse: CreateUserResponse = {
        newUser: newUser.toObject({ getters: true }),
        msg: created.message,
    };
    res.status(created.status).json(createUserResponse);
};

const deleteUser: RequestHandler = async (
    req: AuthRequest<{ email: string }>,
    res,
    next
) => {
    const { email } = req.body;

    try {
        await UserModel.deleteOne({ email });
    } catch (err) {
        const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
        const error = new HttpError(isa.message, isa.status, err);
        return next(error);
    }

    const ok = httpStatusTypes[httpStatusNames.OK];
    res.status(ok.status).json({ msg: ok.message });
};

export default { createUser, deleteUser };
