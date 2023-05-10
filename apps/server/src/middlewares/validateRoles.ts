/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RequestHandler } from "express";
import intersection from "lodash/intersection";

import {
    HttpError,
    httpStatusTypes,
    httpStatusNames,
    UserRole,
} from "@ta/shared/utils";

import { AuthRequest } from "../utils/interfaces";

const validateRoles =
    (roles: UserRole[]): RequestHandler =>
    (req: AuthRequest<object>, _, next) => {
        const authRoles = req.authRoles!;
        if (intersection(roles, authRoles).length === 0) {
            const forbidden = httpStatusTypes[httpStatusNames.FORBIDDEN];
            const error = new HttpError(forbidden.message, forbidden.status);
            return next(error);
        }
        next();
    };

export default validateRoles;
