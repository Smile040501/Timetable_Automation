/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useMemo, useState, useRef, useEffect } from "react";
import { Link as RouterLink, LinkProps } from "react-router-dom";

import { styled } from "@mui/material/styles";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, {
    AccordionSummaryProps,
} from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
    executeGen1 as executeRandomizedGeneticAlgo,
    executeGen2 as executeGreedyGeneticAlgo,
    executeSA as executeSimulatedAnnealing,
} from "@ta/shared/algorithms";
import { AlgorithmConfigData } from "@ta/shared/utils";

import { updateClasses, updateData } from "../redux/actions";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import {
    makeClassesSelector,
    makeCoursesSelector,
    makeRoomsSelector,
    makeSlotsSelector,
} from "../redux/selectors";

const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    "&:not(:last-child)": {
        borderBottom: 0,
    },
    "&:before": {
        display: "none",
    },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary
        expandIcon={<ArrowForwardIosRoundedIcon sx={{ fontSize: "0.9rem" }} />}
        {...props}
    />
))(({ theme }) => ({
    backgroundColor: theme.palette.primary[theme.palette.mode],
    flexDirection: "row-reverse",
    "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
        transform: "rotate(90deg)",
    },
    "& .MuiAccordionSummary-content": {
        marginLeft: theme.spacing(1),
    },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: "1px solid rgba(0, 0, 0, .125)",
    backgroundColor:
        theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, .05)"
            : "rgba(0, 0, 0, .03)",
}));

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

const algorithmOptions = [
    {
        name: "Randomized Genetic Algorithm",
        value: "geneticAlgo1",
        algorithm: executeRandomizedGeneticAlgo,
    },
    {
        name: "Greedy and Maximal Genetic Algorithm",
        value: "geneticAlgo2",
        algorithm: executeGreedyGeneticAlgo,
    },
    {
        name: "Simulated Annealing",
        value: "simulatedAnnealing",
        algorithm: executeSimulatedAnnealing,
    },
];

const defaultAlgorithmConfig: AlgorithmConfigData = {
    VERBOSE: process.env.NODE_ENV === "development",
    RANDOM_DATA: true,
    UPPER_BOUND: 10000,
    MIN_NUM_FACULTY: 2,
    NUM_PME: 0,
    EXPANDED_SLOTS: false,
    inputCourses: [],
    inputRooms: [],
    inputSlots: [],
};

const GenerateTimetable: React.FC = () => {
    const dispatch = useAppDispatch();

    const coursesSelector = useMemo(makeCoursesSelector, []);
    const roomsSelector = useMemo(makeRoomsSelector, []);
    const slotsSelector = useMemo(makeSlotsSelector, []);
    const generatedClassesSelector = useMemo(makeClassesSelector, []);

    const inputCourses = useAppSelector(coursesSelector);
    const inputRooms = useAppSelector(roomsSelector);
    const inputSlots = useAppSelector(slotsSelector);
    const generatedClasses = useAppSelector(generatedClassesSelector);

    const [algorithm, setAlgorithm] = useState(algorithmOptions[0].value);
    const [algorithmLogs, setAlgorithmLogs] = useState<string[]>([]);
    const [expanded, setExpanded] = useState(false);

    const bottomRef = useRef<HTMLDetailsElement>(null!);

    const handleAlgorithmChange = (event: SelectChangeEvent) => {
        setAlgorithm(event.target.value);
        setExpanded(false);
        setAlgorithmLogs([]);
    };

    const handleExpandedChange = (
        event: React.SyntheticEvent,
        isExpanded: boolean
    ) => {
        setExpanded(isExpanded);
    };

    const addAlgorithmLogs = (algorithmLog: any) => {
        setAlgorithmLogs((previousLogs) => [
            ...previousLogs,
            typeof algorithmLog === "string" ? algorithmLog : "",
            "\n",
        ]);
    };

    const handleButtonClick = async () => {
        await setExpanded(true);
        const [data, , classes] = await algorithmOptions
            .find((algo) => algo.value === algorithm)
            ?.algorithm({
                ...defaultAlgorithmConfig,
                inputCourses,
                inputRooms,
                inputSlots,
                logFunc: addAlgorithmLogs,
            })!;
        dispatch(updateClasses(classes));
        dispatch(updateData(data));
    };

    useEffect(() => {
        bottomRef.current?.scrollTo({
            top: bottomRef.current?.scrollHeight,
            behavior: "smooth",
        });
    }, [algorithmLogs]);

    return (
        <Paper
            sx={{
                p: 4,
                height: "auto",
            }}
        >
            <Grid container spacing={3}>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <InputLabel id="algorithm">Select Algorithm</InputLabel>
                        <Select
                            labelId="algorithm"
                            id="select-algorithm"
                            value={algorithm}
                            label="Select Algorithm"
                            onChange={handleAlgorithmChange}
                        >
                            {algorithmOptions.map((option, optionIdx) => (
                                <MenuItem value={option.value} key={optionIdx}>
                                    {option.name}
                                </MenuItem>
                            ))}
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
                    >
                        Generate Timetable
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Accordion
                        expanded={expanded}
                        onChange={handleExpandedChange}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="algorithm-logs-content"
                            id="algorithm-logs"
                        >
                            <Typography>Algorithm Logs</Typography>
                        </AccordionSummary>
                        <AccordionDetails
                            sx={{ maxHeight: 400, overflow: "scroll" }}
                            ref={bottomRef}
                        >
                            {algorithmLogs.map((algorithmLog, logIdx) => (
                                <Typography
                                    sx={{
                                        whiteSpace: "pre-wrap",
                                    }}
                                    key={logIdx}
                                >
                                    {algorithmLog}
                                </Typography>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                </Grid>
                {generatedClasses.length !== 0 && (
                    <Grid item xs={4}>
                        <LinkButton
                            to="/timetable"
                            buttonText="See Timetable"
                        />
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
};

export default GenerateTimetable;
