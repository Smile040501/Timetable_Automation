import { Types } from "mongoose";

import { UserRole } from "@ta/shared/utils";

export interface User {
    _id: Types.ObjectId;
    name: string;
    email: string;
    roles: UserRole[];
}

export interface AuthUserState {
    token: string;
    email: string;
    name: string;
    image: string;
    roles: UserRole[];
}
