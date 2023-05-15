import { Types } from "mongoose";

import {
    AlgorithmStatus,
    ClassAsReturned,
    CourseAsJSON,
    DataUploaded,
    RoomAsJSON,
    SlotAsUploaded,
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

export type MongooseReturnedObject<T> = T & { _id: Types.ObjectId } & Required<{
        _id: Types.ObjectId;
    }>;

export interface CreateUserResponse extends MsgResponse {
    newUser: MongooseReturnedObject<User>;
}

export interface FetchCoursesResponse extends MsgResponse {
    courses: MongooseReturnedObject<CourseAsJSON>[];
}

export interface FetchRoomsResponse extends MsgResponse {
    rooms: MongooseReturnedObject<RoomAsJSON>[];
}

export interface FetchSlotsResponse extends MsgResponse {
    slots: MongooseReturnedObject<SlotAsUploaded>[];
}

export interface FetchAlgorithmDataResponse extends MsgResponse {
    algorithmStatus: AlgorithmStatus;
    classes: ClassAsReturned[];
    data?: DataUploaded;
}
