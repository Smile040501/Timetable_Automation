import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../store";

export const makeClassesSelector = () => {
    return createSelector(
        (state: RootState) => state.algorithmData.classes,
        (classes) => classes
    );
};

export const makeDataSelector = () => {
    return createSelector(
        (state: RootState) => state.algorithmData.data,
        (data) => data
    );
};
