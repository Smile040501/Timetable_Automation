import { AlertColor } from "@mui/material";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
    error: Error | null;
    loading: boolean;
    snackbar: {
        open: boolean;
        msg: string;
        severity: AlertColor;
    };
}

const initialState: UIState = {
    error: null,
    loading: false,
    snackbar: {
        open: false,
        msg: "",
        severity: "success",
    },
};

export const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        updateUI: (state, action: PayloadAction<Partial<UIState>>) => {
            return {
                ...state,
                ...action.payload,
            };
        },
    },
});

export const { updateUI } = uiSlice.actions;

export default uiSlice.reducer;
