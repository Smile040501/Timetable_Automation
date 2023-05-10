/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { HttpError, httpStatusNames, httpStatusTypes } from "@ta/shared/utils";

import { environment as env } from "../environment";
import { AuthRequest } from "../utils/interfaces";

const isAuth: RequestHandler = (req: AuthRequest<any>, _, next) => {
    const un = httpStatusTypes[httpStatusNames.UNAUTHORIZED];
    const error = new HttpError(un.message, un.status);

    const authHeader = req.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(error);
    }

    const token = authHeader.split(" ")[1];
    if (!token || token === "") {
        return next(error);
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(
            token,
            env.jwtSecretKey!
        ) as jwt.AuthJWTPayload;
    } catch (err) {
        const isa = httpStatusTypes[httpStatusNames.INTERNAL_SERVER_ERROR];
        const error = new HttpError(isa.message, isa.status, err);
        return next(error);
    }

    if (!decodedToken) {
        return next(error);
    }

    req.isAuth = true;
    req.authEmail = decodedToken.email;
    req.authRoles = decodedToken.roles;
    next();
};

export default isAuth;
