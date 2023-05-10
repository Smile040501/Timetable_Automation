/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RequestHandler } from "express";
import { TokenPayload } from "google-auth-library";
import jwt from "jsonwebtoken";
import some from "lodash/some";
import { validationResult } from "express-validator";

import { User, AuthResponse } from "@ta/shared/models";
import {
    HttpError,
    httpStatusTypes,
    httpStatusNames,
    UserRole,
} from "@ta/shared/utils";

import { environment as env } from "../environment";
import UserModel from "../models/user";
import { getProfileInfo } from "../utils/googleOAuth";
import { CustomRequest } from "../utils/interfaces";

const createAdmin: RequestHandler = async (
    req: CustomRequest<{ name: string; email: string }>,
    res,
    next
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const ue = httpStatusTypes[httpStatusNames.UNPROCESSABLE_ENTITY];
        const error = new HttpError(ue.message, ue.status, errors);
        return next(error);
    }

    const { name, email } = req.body;
    const roles = [UserRole.Admin];

    const newAdmin = new UserModel({ name, email, roles });

    try {
        await newAdmin.save();
    } catch (err) {
        const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
        const error = new HttpError(isa.message, isa.status, err);
        return next(error);
    }

    const created = httpStatusTypes[httpStatusNames.CREATED];
    res.status(created.status).json({
        admin: newAdmin.toObject({ getters: true }),
        msg: created.message,
    });
};

const signIn: RequestHandler = async (
    req: CustomRequest<{ credential: string }>,
    res,
    next
) => {
    let profileInfo: TokenPayload | undefined;
    let user: User | null;
    try {
        profileInfo = await getProfileInfo(req.body.credential);
        if (!profileInfo || !profileInfo.email) {
            const un = httpStatusTypes[httpStatusNames.UNAUTHORIZED];
            const error = new HttpError(un.message, un.status);
            return next(error);
        }

        user = await UserModel.findOne({ email: profileInfo.email });
    } catch (err) {
        const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
        const error = new HttpError(isa.message, isa.status, err);
        return next(error);
    }

    let roles: UserRole[];
    if (user) {
        roles = user.roles;
    } else if (env.testerEmails!.split(",").indexOf(profileInfo.email) !== -1) {
        roles = [UserRole.Admin];
    } else if (
        some(env.allowedEmailDomains!.split(","), (domain) => {
            return profileInfo!.email?.endsWith(domain);
        })
    ) {
        roles = [UserRole.Guest];
    } else {
        const un = httpStatusTypes[httpStatusNames.UNAUTHORIZED];
        const error = new HttpError(un.message, un.status);
        return next(error);
    }

    const token = jwt.sign(
        { email: profileInfo.email, roles },
        env.jwtSecretKey!,
        {
            expiresIn: +env.jwtAccessTokenExpiration!,
        }
    );

    const ok = httpStatusTypes[httpStatusNames.OK];
    const authResponse: AuthResponse = {
        msg: ok.message,
        email: profileInfo.email,
        name: profileInfo.name || "NAME",
        image: profileInfo.picture || "IMAGE",
        roles,
        token,
        tokenExpiration: +env.jwtAccessTokenExpiration!,
    };
    res.status(ok.status).json(authResponse);
};

export default { createAdmin, signIn };
