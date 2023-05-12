import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import {
    CourseAsJSON,
    RoomAsJSON,
    SlotAsJSON,
    convertSlotsJSONToUploaded,
    convertSlotsUploadedToJSON,
    httpStatusNames,
    httpStatusTypes,
} from "@ta/shared/utils";
import {
    FetchCoursesResponse,
    FetchRoomsResponse,
    FetchSlotsResponse,
} from "@ta/shared/models";

import { AppThunk } from "../store";
import axios from "../../axios";
import { updateUI } from "./ui";

export interface UploadedDataState {
    courses: CourseAsJSON[];
    rooms: RoomAsJSON[];
    slots: SlotAsJSON[];
}

const initialState: UploadedDataState = {
    courses: [],
    rooms: [],
    slots: [],
};

export const uploadedDataSlice = createSlice({
    name: "uploadedData",
    initialState,
    reducers: {
        setCourses: (state, action: PayloadAction<CourseAsJSON[]>) => {
            state.courses = action.payload;
        },
        setRooms: (state, action: PayloadAction<RoomAsJSON[]>) => {
            state.rooms = action.payload;
        },
        setSlots: (state, action: PayloadAction<SlotAsJSON[]>) => {
            state.slots = action.payload;
        },
    },
});

const { setCourses, setRooms, setSlots } = uploadedDataSlice.actions;

export const getCourses = (): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(updateUI({ error: null, loading: true }));

        const res = await axios.get<FetchCoursesResponse>("/courses/get", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (res.status !== httpStatusTypes[httpStatusNames.OK].status) {
            throw new Error("Failed to Fetch Courses!");
        }

        const { courses } = res.data;

        dispatch(
            updateUI({
                error: null,
                loading: false,
                snackbar: {
                    open: true,
                    msg: "Successfully Fetched Courses!",
                    severity: "success",
                },
            })
        );
        dispatch(setCourses(courses));
    } catch (err) {
        console.log(err);
        dispatch(
            updateUI({
                error: new Error("Failed to Fetch Courses!"),
                loading: false,
                snackbar: {
                    open: true,
                    msg: "Failed to Fetch Courses!",
                    severity: "error",
                },
            })
        );
    }
};

export const uploadCourses =
    (courses: CourseAsJSON[]): AppThunk =>
    async (dispatch, getState) => {
        try {
            dispatch(updateUI({ error: null, loading: true }));

            const res = await axios.post(
                "/courses/upload",
                { courses },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            if (res.status !== httpStatusTypes[httpStatusNames.OK].status) {
                throw new Error("Failed to Upload Courses!");
            }

            dispatch(
                updateUI({
                    error: null,
                    loading: false,
                    snackbar: {
                        open: true,
                        msg: "Successfully Uploaded Courses!",
                        severity: "success",
                    },
                })
            );
            dispatch(setCourses(courses));
        } catch (err) {
            console.log(err);
            dispatch(
                updateUI({
                    error: new Error("Failed to Upload Courses!"),
                    loading: false,
                    snackbar: {
                        open: true,
                        msg: "Failed to Upload Courses!",
                        severity: "error",
                    },
                })
            );
        }
    };

export const getRooms = (): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(updateUI({ error: null, loading: true }));

        const res = await axios.get<FetchRoomsResponse>("/rooms/get", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (res.status !== httpStatusTypes[httpStatusNames.OK].status) {
            throw new Error("Failed to Fetch Rooms!");
        }

        const { rooms } = res.data;

        dispatch(
            updateUI({
                error: null,
                loading: false,
                snackbar: {
                    open: true,
                    msg: "Successfully Fetched Rooms!",
                    severity: "success",
                },
            })
        );
        dispatch(setRooms(rooms));
    } catch (err) {
        console.log(err);
        dispatch(
            updateUI({
                error: new Error("Failed to Fetch Rooms!"),
                loading: false,
                snackbar: {
                    open: true,
                    msg: "Failed to Fetch Rooms!",
                    severity: "error",
                },
            })
        );
    }
};

export const uploadRooms =
    (rooms: RoomAsJSON[]): AppThunk =>
    async (dispatch, getState) => {
        try {
            dispatch(updateUI({ error: null, loading: true }));

            const res = await axios.post(
                "/rooms/upload",
                { rooms },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            if (res.status !== httpStatusTypes[httpStatusNames.OK].status) {
                throw new Error("Failed to Upload Rooms!");
            }

            dispatch(
                updateUI({
                    error: null,
                    loading: false,
                    snackbar: {
                        open: true,
                        msg: "Successfully Uploaded Rooms!",
                        severity: "success",
                    },
                })
            );
            dispatch(setRooms(rooms));
        } catch (err) {
            console.log(err);
            dispatch(
                updateUI({
                    error: new Error("Failed to Upload Rooms!"),
                    loading: false,
                    snackbar: {
                        open: true,
                        msg: "Failed to Upload Rooms!",
                        severity: "error",
                    },
                })
            );
        }
    };

export const getSlots = (): AppThunk => async (dispatch, getState) => {
    try {
        dispatch(updateUI({ error: null, loading: true }));

        const res = await axios.get<FetchSlotsResponse>("/slots/get", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (res.status !== httpStatusTypes[httpStatusNames.OK].status) {
            throw new Error("Failed to Fetch Slots!");
        }

        const { slots } = res.data;

        dispatch(
            updateUI({
                error: null,
                loading: false,
                snackbar: {
                    open: true,
                    msg: "Successfully Fetched Slots!",
                    severity: "success",
                },
            })
        );
        dispatch(
            setSlots(slots.map((slot) => convertSlotsUploadedToJSON(slot)))
        );
    } catch (err) {
        console.log(err);
        dispatch(
            updateUI({
                error: new Error("Failed to Fetch Slots!"),
                loading: false,
                snackbar: {
                    open: true,
                    msg: "Failed to Fetch Slots!",
                    severity: "error",
                },
            })
        );
    }
};

export const uploadSlots =
    (slots: SlotAsJSON[]): AppThunk =>
    async (dispatch, getState) => {
        try {
            dispatch(updateUI({ error: null, loading: true }));

            const res = await axios.post(
                "/slots/upload",
                {
                    slots: slots.map((slot) =>
                        convertSlotsJSONToUploaded(slot)
                    ),
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                }
            );

            if (res.status !== httpStatusTypes[httpStatusNames.OK].status) {
                throw new Error("Failed to Upload Slots!");
            }

            dispatch(
                updateUI({
                    error: null,
                    loading: false,
                    snackbar: {
                        open: true,
                        msg: "Successfully Uploaded Slots!",
                        severity: "success",
                    },
                })
            );
            dispatch(setSlots(slots));
        } catch (err) {
            console.log(err);
            dispatch(
                updateUI({
                    error: new Error("Failed to Upload Slots!"),
                    loading: false,
                    snackbar: {
                        open: true,
                        msg: "Failed to Upload Slots!",
                        severity: "error",
                    },
                })
            );
        }
    };

export default uploadedDataSlice.reducer;
