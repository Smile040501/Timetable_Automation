import { configureStore } from "@reduxjs/toolkit";

import uploadedDataReducer from "./slices/uploadedData";
import generatedClassesReducer from "./slices/generatedClasses";

export const store = configureStore({
    reducer: {
        uploadedData: uploadedDataReducer,
        generatedClasses: generatedClassesReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
