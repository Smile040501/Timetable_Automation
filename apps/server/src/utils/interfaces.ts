/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";

import { UserRole } from "@ta/shared/utils";

export type CustomRequest<T, U = unknown> = Request<ParamsDictionary, any, T> &
    U;

export type AuthRequest<T> = Request<ParamsDictionary, any, T> & {
    isAuth?: boolean;
    authEmail?: string;
    authRoles?: UserRole[];
};
