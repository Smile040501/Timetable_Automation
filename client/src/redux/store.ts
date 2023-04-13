import { configureStore } from "@reduxjs/toolkit";

import uploadedDataReducer from "./slices/uploadedData";

export const store = configureStore({
    reducer: {
        uploadedData: uploadedDataReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
