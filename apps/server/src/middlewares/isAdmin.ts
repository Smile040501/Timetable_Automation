/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RequestHandler } from "express";

import {
    HttpError,
    httpStatusTypes,
    httpStatusNames,
    UserRole,
} from "@ta/shared/utils";

import { AuthRequest } from "../utils/interfaces";

const isAdmin: RequestHandler = (req: AuthRequest<object>, _, next) => {
    const authRoles = req.authRoles!;
    if (!authRoles.includes(UserRole.Admin)) {
        const forbidden = httpStatusTypes[httpStatusNames.FORBIDDEN];
        const error = new HttpError(forbidden.message, forbidden.status);
        return next(error);
    }
    next();
};

export default isAdmin;
