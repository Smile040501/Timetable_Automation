import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { CourseAsJSON, RoomAsJSON, SlotAsJSON } from "../../interfaces";

export interface UploadedDataState {
    courses: CourseAsJSON[];
    rooms: RoomAsJSON[];
    slots: SlotAsJSON[];
}

const initialState: UploadedDataState = {
    courses: [],
    rooms: [],
    slots: [],
};

export const uploadedDataSlice = createSlice({
    name: "uploadedData",
    initialState,
    reducers: {
        uploadCourses: (state, action: PayloadAction<CourseAsJSON[]>) => {
            state.courses = action.payload;
        },
        uploadRooms: (state, action: PayloadAction<RoomAsJSON[]>) => {
            state.rooms = action.payload;
        },
        uploadSlots: (state, action: PayloadAction<SlotAsJSON[]>) => {
            state.slots = action.payload;
        },
    },
});

export const { uploadCourses, uploadRooms, uploadSlots } =
    uploadedDataSlice.actions;

export default uploadedDataSlice.reducer;
