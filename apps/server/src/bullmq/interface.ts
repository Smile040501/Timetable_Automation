import { Class, Data, Logger, MongooseReturnedObject } from "@ta/shared/models";
import {
    AlgorithmConfigData,
    CourseAsJSON,
    RoomAsJSON,
    SlotAsUploaded,
} from "@ta/shared/utils";

export interface AlgorithmJobInputData {
    algorithmId: string;
    algorithmConfig: AlgorithmConfigData;
    courses: MongooseReturnedObject<CourseAsJSON>[];
    rooms: MongooseReturnedObject<RoomAsJSON>[];
    slots: MongooseReturnedObject<SlotAsUploaded>[];
}

export interface AlgorithmJobResultData {
    algorithmResult: [Data, Logger, Class<null>[]];
    courses: MongooseReturnedObject<CourseAsJSON>[];
    rooms: MongooseReturnedObject<RoomAsJSON>[];
    slots: MongooseReturnedObject<SlotAsUploaded>[];
}
