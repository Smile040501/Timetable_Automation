import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import { AuthUserState, AuthResponse } from "@ta/shared/models";
import { httpStatusNames, httpStatusTypes } from "@ta/shared/utils";

import axios from "../../axios";
import { AppThunk } from "../store";
import { updateUI } from "./ui";
import { router } from "../../App";

const initialState: AuthUserState = {
    token: "",
    email: "",
    name: "",
    image: "",
    roles: [],
};

export const authUserSlice = createSlice({
    name: "authUser",
    initialState,
    reducers: {
        authSuccess: (state, action: PayloadAction<AuthUserState>) => {
            return {
                ...state,
                ...action.payload,
            };
        },
        resetState: (state) => {
            return initialState;
        },
    },
});

const { authSuccess, resetState } = authUserSlice.actions;

const authStart = (): AppThunk => (dispatch, getState) => {
    dispatch(updateUI({ error: null, loading: true }));
};

const authSuccessState =
    (userInfo: AuthUserState, showSnackbar: boolean): AppThunk =>
    (dispatch, getState) => {
        dispatch(authSuccess(userInfo));
        if (showSnackbar) {
            dispatch(
                updateUI({
                    error: null,
                    loading: false,
                    snackbar: {
                        open: true,
                        msg: "Successfully Signed In!",
                        severity: "success",
                    },
                })
            );
            router.navigate("/");
        } else {
            dispatch(updateUI({ error: null, loading: false }));
        }
    };

const authFailState =
    (err: Error): AppThunk =>
    (dispatch, getState) => {
        dispatch(resetState());
        dispatch(
            updateUI({
                error: err,
                loading: false,
                snackbar: {
                    open: true,
                    msg: "Failed to Sign In!",
                    severity: "error",
                },
            })
        );
    };

const checkAuthTimeout =
    (expirationTime: number): AppThunk =>
    async (dispatch, getState) => {
        setTimeout(() => {
            dispatch(authLogout());
        }, expirationTime * 1000);
    };

export const auth =
    (credential: string): AppThunk =>
    async (dispatch, getState) => {
        dispatch(authStart());

        try {
            const res = await axios.post<AuthResponse>("/auth/signIn", {
                credential,
            });

            if (res.status !== httpStatusTypes[httpStatusNames.OK].status) {
                throw new Error("Error Signing Up!");
            }

            const { email, name, image, roles, token, tokenExpiration } =
                res.data;
            const userInfo: AuthUserState = {
                email,
                name,
                image,
                roles,
                token,
            };
            const expirationDate = new Date(
                new Date().getTime() + tokenExpiration * 1000
            );

            localStorage.setItem("token", token);
            localStorage.setItem(
                "expirationDate",
                expirationDate.toISOString()
            );
            localStorage.setItem("userInfo", JSON.stringify(userInfo));

            dispatch(authSuccessState(userInfo, true));
            dispatch(checkAuthTimeout(tokenExpiration));
        } catch (err) {
            console.log(err);
            dispatch(authFailState(new Error("Error Signing Up!")));
        }
    };

export const authCheckState = (): AppThunk => async (dispatch, getState) => {
    const token = localStorage.getItem("token");
    const expDate = localStorage.getItem("expirationDate");
    const userInfo = localStorage.getItem("userInfo");

    if (!token || !expDate || !userInfo) {
        dispatch(authLogout());
        return;
    }

    const expirationDate = new Date(expDate);
    if (expirationDate <= new Date()) {
        dispatch(authLogout());
        return;
    }

    const user = JSON.parse(userInfo) as AuthUserState;
    dispatch(authSuccessState(user, false));
    dispatch(
        checkAuthTimeout(
            (expirationDate.getTime() - new Date().getTime()) / 1000
        )
    );
};

export const authLogout = (): AppThunk => (dispatch, getState) => {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationDate");
    localStorage.removeItem("userInfo");
    dispatch(resetState());
};

export default authUserSlice.reducer;
