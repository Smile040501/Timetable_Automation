import { createSelector } from "@reduxjs/toolkit";

import { RootState } from "../store";

export const makeCoursesSelector = () => {
    return createSelector(
        (state: RootState) => state.uploadedData.courses,
        (courses) => courses
    );
};

export const makeRoomsSelector = () => {
    return createSelector(
        (state: RootState) => state.uploadedData.rooms,
        (rooms) => rooms
    );
};

export const makeSlotsSelector = () => {
    return createSelector(
        (state: RootState) => state.uploadedData.slots,
        (slots) => slots
    );
};
