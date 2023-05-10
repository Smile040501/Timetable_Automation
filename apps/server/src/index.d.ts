import jwt from "jsonwebtoken";

import { UserRole } from "@ta/shared/utils";

declare module "jsonwebtoken" {
    export interface AuthJWTPayload extends jwt.JwtPayload {
        email: string;
        roles: UserRole[];
    }
}
