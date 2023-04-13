import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { CourseAsJSON, RoomsAsJSON, SlotsAsJSON } from "../../utils/interfaces";

export interface UploadedDataState {
    courses: CourseAsJSON[];
    rooms: RoomsAsJSON[];
    slots: SlotsAsJSON[];
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
        uploadRooms: (state, action: PayloadAction<RoomsAsJSON[]>) => {
            state.rooms = action.payload;
        },
        uploadSlots: (state, action: PayloadAction<SlotsAsJSON[]>) => {
            state.slots = action.payload;
        },
    },
});

export const { uploadCourses, uploadRooms, uploadSlots } =
    uploadedDataSlice.actions;

export default uploadedDataSlice.reducer;
