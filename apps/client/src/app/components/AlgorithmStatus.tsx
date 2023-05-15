import React, { useEffect, useMemo } from "react";

import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { makeAlgorithmStatusSelector } from "../redux/selectors";
import { getAlgorithmStatus } from "../redux/actions";
import { AlgorithmStatus } from "@ta/shared/utils";

const AlgorithmStatusComponent: React.FC = () => {
    const dispatch = useAppDispatch();

    const algorithmStatusSelector = useMemo(makeAlgorithmStatusSelector, []);
    const algorithmStatus = useAppSelector(algorithmStatusSelector);

    const getStatusColor = (algorithmStatus: AlgorithmStatus) => {
        switch (algorithmStatus) {
            case AlgorithmStatus.UNEXECUTED:
                return "warning.main";
            case AlgorithmStatus.COMPLETED:
                return "success.main";
            case AlgorithmStatus.PENDING:
                return "info.main";
            case AlgorithmStatus.FAILED:
                return "error.main";
        }
    };

    const getStatusIcon = (algorithmStatus: AlgorithmStatus) => {
        switch (algorithmStatus) {
            case AlgorithmStatus.UNEXECUTED:
                return <HelpRoundedIcon />;
            case AlgorithmStatus.COMPLETED:
                return <CheckCircleRoundedIcon />;
            case AlgorithmStatus.PENDING:
                return <PendingRoundedIcon />;
            case AlgorithmStatus.FAILED:
                return <ErrorRoundedIcon />;
        }
    };

    useEffect(() => {
        dispatch(getAlgorithmStatus());
    }, [dispatch]);

    const handleClick = () => {
        dispatch(getAlgorithmStatus());
    };

    return (
        <Paper
            sx={{
                p: 1,
                display: "flex",
                alignItems: "center",
            }}
        >
            <Tooltip title="Refresh" arrow>
                <IconButton
                    aria-label="refresh"
                    color="secondary"
                    onClick={handleClick}
                >
                    <RefreshRoundedIcon />
                </IconButton>
            </Tooltip>
            <Typography component="p" variant="h6">
                {`Algorithm Status:`}
            </Typography>
            &nbsp;
            <Typography
                component="p"
                variant="h6"
                color={getStatusColor(algorithmStatus)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                }}
            >
                {getStatusIcon(algorithmStatus)}
                &nbsp;
                {algorithmStatus}
            </Typography>
        </Paper>
    );
};

export default AlgorithmStatusComponent;
