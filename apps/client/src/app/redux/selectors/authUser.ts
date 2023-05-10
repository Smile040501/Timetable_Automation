import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../store";

export const makeUserInfoSelector = () => {
    return createSelector(
        (state: RootState) => state.authUser,
        (userInfo) => userInfo
    );
};
