/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { FetchAlgorithmDataResponse } from "@ta/shared/models";
import {
    AlgorithmStatus,
    ClassAsReturned,
    DataUploaded,
    httpStatusNames,
    httpStatusTypes,
} from "@ta/shared/utils";
import { AppThunk } from "../store";
import { updateUI } from "./ui";
import axios from "../../axios";

const initialState: FetchAlgorithmDataResponse = {
    msg: "",
    algorithmStatus: AlgorithmStatus.UNEXECUTED,
    classes: [],
};

export const algorithmDataSlice = createSlice({
    name: "algorithmData",
    initialState,
    reducers: {
        updateAlgorithmStatus: (
            state,
            action: PayloadAction<AlgorithmStatus>
        ) => {
            state.algorithmStatus = action.payload;
        },
        updateClasses: (state, action: PayloadAction<ClassAsReturned[]>) => {
            state.classes = action.payload;
        },
        updateData: (state, action: PayloadAction<DataUploaded>) => {
            state.data = action.payload;
        },
    },
});

export const { updateAlgorithmStatus, updateClasses, updateData } =
    algorithmDataSlice.actions;

export const generateTimetable =
    (algorithmId: string): AppThunk =>
    async (dispatch, getState) => {
        try {
            dispatch(updateUI({ error: null, loading: true }));

            const res = await axios.post<FetchAlgorithmDataResponse>(
                "/algorithm/generateTimetable",
                { algorithmId },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            if (res.status !== httpStatusTypes[httpStatusNames.OK].status) {
                if (
                    res.status ===
                    httpStatusTypes[httpStatusNames.BAD_REQUEST].status
                ) {
                    return dispatch(
                        updateUI({
                            error: null,
                            loading: false,
                            snackbar: {
                                open: true,
                                msg: "Algorithm Already Running!",
                                severity: "error",
                            },
                        })
                    );
                } else if (
                    res.status ===
                    httpStatusTypes[httpStatusNames.METHOD_NOT_ALLOWED].status
                ) {
                    return dispatch(
                        updateUI({
                            error: null,
                            loading: false,
                            snackbar: {
                                open: true,
                                msg: "Algorithm Method Not Found!",
                                severity: "error",
                            },
                        })
                    );
                } else if (
                    res.status ===
                    httpStatusTypes[httpStatusNames.PRECONDITION_FAILED].status
                ) {
                    return dispatch(
                        updateUI({
                            error: null,
                            loading: false,
                            snackbar: {
                                open: true,
                                msg: "All the Required Data Not Uploaded!",
                                severity: "error",
                            },
                        })
                    );
                } else {
                    throw new Error("Failed to Generate Timetable!");
                }
            }

            const { algorithmStatus } = res.data;

            dispatch(
                updateUI({
                    error: null,
                    loading: false,
                    snackbar: {
                        open: true,
                        msg: "Successfully Started Algorithm Execution!",
                        severity: "success",
                    },
                })
            );
            dispatch(updateAlgorithmStatus(algorithmStatus));
        } catch (err) {
            console.log(err);
            dispatch(
                updateUI({
                    error: new Error("Failed to Generate Timetable!"),
                    loading: false,
                    snackbar: {
                        open: true,
                        msg: "Failed to Generate Timetable!",
                        severity: "error",
                    },
                })
            );
        }
    };

export const getAlgorithmStatus =
    (): AppThunk => async (dispatch, getState) => {
        try {
            dispatch(updateUI({ error: null, loading: true }));

            const res = await axios.get<FetchAlgorithmDataResponse>(
                "/algorithm/algorithmStatus",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            if (res.status !== httpStatusTypes[httpStatusNames.OK].status) {
                throw new Error("Failed to Get Algorithm Status!");
            }

            const { algorithmStatus } = res.data;

            dispatch(
                updateUI({
                    error: null,
                    loading: false,
                    snackbar: {
                        open: true,
                        msg: "Refreshed Algorithm Status!",
                        severity: "success",
                    },
                })
            );
            dispatch(updateAlgorithmStatus(algorithmStatus));
        } catch (err) {
            console.log(err);
            dispatch(
                updateUI({
                    error: new Error("Failed to Get Algorithm Status!"),
                    loading: false,
                    snackbar: {
                        open: true,
                        msg: "Failed to Refresh Algorithm Status!",
                        severity: "error",
                    },
                })
            );
        }
    };

export const getTimetableData = (): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(updateUI({ error: null, loading: true }));

        const res = await axios.get<FetchAlgorithmDataResponse>(
            "/algorithm/timetableData",
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );

        if (res.status !== httpStatusTypes[httpStatusNames.OK].status) {
            throw new Error("Failed to Get Timetable Data!");
        }

        const { algorithmStatus, classes } = res.data;
        const algorithmData = res.data.data!;

        dispatch(
            updateUI({
                error: null,
                loading: false,
                snackbar: {
                    open: true,
                    msg: "Successfully Fetched Timetable Data!",
                    severity: "success",
                },
            })
        );
        dispatch(updateAlgorithmStatus(algorithmStatus));
        dispatch(updateClasses(classes));
        dispatch(updateData(algorithmData));
    } catch (err) {
        console.log(err);
        dispatch(
            updateUI({
                error: new Error("Failed to Get Timetable Data!"),
                loading: false,
                snackbar: {
                    open: true,
                    msg: "Failed to Get Timetable Data!",
                    severity: "error",
                },
            })
        );
    }
};

export default algorithmDataSlice.reducer;
