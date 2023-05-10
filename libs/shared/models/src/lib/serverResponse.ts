import { Types } from "mongoose";

import {
    CourseAsJSON,
    RoomAsJSON,
    SlotAsJSON,
    UserRole,
} from "@ta/shared/utils";

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

export interface FetchCoursesResponse extends MsgResponse {
    courses: (CourseAsJSON & { _id: Types.ObjectId } & Required<{
            _id: Types.ObjectId;
        }>)[];
}

export interface FetchRoomsResponse extends MsgResponse {
    rooms: (RoomAsJSON & { _id: Types.ObjectId } & Required<{
            _id: Types.ObjectId;
        }>)[];
}

export interface FetchSlotsResponse extends MsgResponse {
    slots: (SlotAsJSON & { _id: Types.ObjectId } & Required<{
            _id: Types.ObjectId;
        }>)[];
}
