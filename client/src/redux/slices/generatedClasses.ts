import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import Class from "../../algorithms/models/class";

export interface GeneratedClassesState {
    classes: Class[];
}

const initialState: GeneratedClassesState = {
    classes: [],
};

export const generatedClassesSlice = createSlice({
    name: "generatedClasses",
    initialState,
    reducers: {
        updateClasses: (state, action: PayloadAction<Class[]>) => {
            state.classes = action.payload;
        },
    },
});

export const { updateClasses } = generatedClassesSlice.actions;

export default generatedClassesSlice.reducer;
