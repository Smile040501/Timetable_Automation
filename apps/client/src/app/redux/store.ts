import { AnyAction, ThunkAction, configureStore } from "@reduxjs/toolkit";

import { environment as env } from "../../environment";
import algorithmDataReducer from "./slices/algorithmData";
import authUserReducer from "./slices/authUser";
import uiReducer from "./slices/ui";
import uploadedDataReducer from "./slices/uploadedData";

export const store = configureStore({
    reducer: {
        algorithmData: algorithmDataReducer,
        authUser: authUserReducer,
        ui: uiReducer,
        uploadedData: uploadedDataReducer,
    },
    devTools: !env.production,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    AnyAction
>;
