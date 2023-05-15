import React, { useMemo, useState } from "react";
import { Link as RouterLink, LinkProps } from "react-router-dom";

import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Paper from "@mui/material/Paper";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";

import { algorithmOptions } from "@ta/shared/algorithms";

import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { makeAlgorithmStatusSelector } from "../redux/selectors";
import { generateTimetable } from "../redux/actions";
import AlgorithmStatusComponent from "../components/AlgorithmStatus";
import { AlgorithmStatus } from "@ta/shared/utils";

const LinkButton: React.FC<{ to: string; buttonText: string }> = (props) => {
    const { to, buttonText } = props;

    const CustomLink = useMemo(
        () =>
            React.forwardRef<HTMLAnchorElement, Omit<LinkProps, "to">>(
                function Link(linkProps, ref) {
                    return <RouterLink ref={ref} to={to} {...linkProps} />;
                }
            ),
        [to]
    );

    return (
        <Button
            variant="contained"
            size="large"
            startIcon={<ArrowForwardRoundedIcon />}
            sx={{
                height: 53.5,
            }}
            component={CustomLink}
        >
            {buttonText}
        </Button>
    );
};

const GenerateTimetable: React.FC = () => {
    const dispatch = useAppDispatch();

    const algorithmStatusSelector = useMemo(makeAlgorithmStatusSelector, []);
    const algorithmStatus = useAppSelector(algorithmStatusSelector);

    const [algorithmId, setAlgorithmId] = useState<string>(
        algorithmOptions[0].id
    );

    const handleAlgorithmChange = (event: SelectChangeEvent) => {
        setAlgorithmId(event.target.value);
    };

    const handleButtonClick = async () => {
        dispatch(generateTimetable(algorithmId));
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <AlgorithmStatusComponent />
            </Grid>
            <Grid item xs={12}>
                <Paper
                    sx={{
                        p: 4,
                        height: "auto",
                    }}
                >
                    <Grid container spacing={4}>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel id="algorithm">
                                    Select Algorithm
                                </InputLabel>
                                <Select
                                    labelId="algorithm"
                                    id="select-algorithm"
                                    value={algorithmId}
                                    label="Select Algorithm"
                                    onChange={handleAlgorithmChange}
                                >
                                    {algorithmOptions.map(
                                        (option, optionIdx) => (
                                            <MenuItem
                                                value={option.id}
                                                key={optionIdx}
                                            >
                                                {option.name}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<ArrowForwardIosRoundedIcon />}
                                onClick={handleButtonClick}
                                sx={{
                                    height: 53.5,
                                }}
                                disabled={
                                    algorithmStatus === AlgorithmStatus.PENDING
                                }
                            >
                                Generate Timetable
                            </Button>
                        </Grid>
                        {algorithmStatus === AlgorithmStatus.COMPLETED && (
                            <Grid item xs={4}>
                                <LinkButton
                                    to="/timetable"
                                    buttonText="See Timetable"
                                />
                            </Grid>
                        )}
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default GenerateTimetable;
