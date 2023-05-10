import React, { useEffect, useMemo } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";

import routes from "./routes";
import { updateUI, authCheckState } from "./redux/actions";
import { makeLoadingSelector, makeSnackbarSelector } from "./redux/selectors";
import { useAppDispatch, useAppSelector } from "./redux/hooks";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const router = createBrowserRouter(routes);

const App: React.FC = () => {
    const dispatch = useAppDispatch();

    const loadingSelector = useMemo(makeLoadingSelector, []);
    const snackbarSelector = useMemo(makeSnackbarSelector, []);

    const loading = useAppSelector(loadingSelector);
    const snackbar = useAppSelector(snackbarSelector);

    useEffect(() => {
        dispatch(authCheckState());
    }, [dispatch]);

    const handleClose = (
        event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === "clickaway") {
            return;
        }

        dispatch(
            updateUI({
                snackbar: { open: false, msg: "", severity: "success" },
            })
        );
    };

    return (
        <>
            <RouterProvider router={router} />
            <Backdrop
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={handleClose}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.msg}
                </Alert>
            </Snackbar>
        </>
    );
};

export default App;
