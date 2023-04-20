import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import Class from "../../algorithms/models/class";
import Data from "../../algorithms/models/data";

export interface AlgorithmDataState {
    classes: Class[];
    data?: Data;
}

const initialState: AlgorithmDataState = {
    classes: [],
};

export const algorithmDataSlice = createSlice({
    name: "algorithmData",
    initialState,
    reducers: {
        updateClasses: (state, action: PayloadAction<Class[]>) => {
            state.classes = action.payload;
        },
        updateData: (state, action: PayloadAction<Data>) => {
            state.data = action.payload;
        },
    },
});

export const { updateClasses, updateData } = algorithmDataSlice.actions;

export default algorithmDataSlice.reducer;
