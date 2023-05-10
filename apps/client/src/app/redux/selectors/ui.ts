import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../store";

export const makeLoadingSelector = () => {
    return createSelector(
        (state: RootState) => state.ui.loading,
        (loading) => loading
    );
};

export const makeErrorSelector = () => {
    return createSelector(
        (state: RootState) => state.ui.error,
        (error) => error
    );
};

export const makeSnackbarSelector = () => {
    return createSelector(
        (state: RootState) => state.ui.snackbar,
        (snackbar) => snackbar
    );
};
