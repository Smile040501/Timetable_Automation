import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../store";

export const makeAlgorithmStatusSelector = () => {
    return createSelector(
        (state: RootState) => state.algorithmData.algorithmStatus,
        (status) => status
    );
};

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
