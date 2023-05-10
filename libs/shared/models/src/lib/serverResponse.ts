import { Types } from "mongoose";

import { UserRole } from "@ta/shared/utils";

import { User } from "./user";

export interface MsgResponse {
    msg: string;
}

export interface AuthResponse extends MsgResponse {
    email: string;
    name: string;
    image: string;
    roles: UserRole[];
    token: string;
    tokenExpiration: number;
}

export interface CreateUserResponse extends MsgResponse {
    newUser: User & Required<{ _id: Types.ObjectId }>;
}
