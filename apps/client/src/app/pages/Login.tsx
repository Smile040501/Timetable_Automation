/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useMemo } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Navigate } from "react-router-dom";

import Paper from "@mui/material/Paper";

import { makeUserInfoSelector } from "../redux/selectors";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { auth } from "../redux/actions";

const Login: React.FC = () => {
    const dispatch = useAppDispatch();

    const userInfoSelector = useMemo(makeUserInfoSelector, []);
    const userInfo = useAppSelector(userInfoSelector);

    if (userInfo.email) {
        return <Navigate to="/" />;
    }

    return (
        <Paper
            sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 240,
                justifyContent: "center",
                textAlign: "center",
                alignItems: "center",
            }}
        >
            <GoogleLogin
                auto_select
                theme="filled_blue"
                size="large"
                shape="circle"
                logo_alignment="left"
                text="continue_with"
                width="500"
                onSuccess={(credentialResponse) => {
                    dispatch(auth(credentialResponse.credential!));
                }}
                onError={() => {
                    console.log("Login Failed");
                }}
            />
        </Paper>
    );
};

export default Login;
