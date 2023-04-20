import React, { useState } from "react";

import { Theme, useTheme } from "@mui/material/styles";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Filters } from "../interfaces";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const defaultFilterOptions: Filters = {
    courses: [],
    rooms: [],
    faculties: [],
    slots: [],
    departments: [],
    courseTypes: [],
    lectureTypes: [],
    campuses: [],
};

const getStyles = (value: string, values: readonly string[], theme: Theme) => {
    return {
        fontWeight:
            values.indexOf(value) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
};

const TimetableFilters: React.FC<{
    filterOptionsValues: Filters;
    handleFiltersChange: (key: string, filterOptions: Filters) => void;
}> = ({ filterOptionsValues, handleFiltersChange }) => {
    const [expanded, setExpanded] = useState(false);

    const handleExpandedChange = (
        event: React.SyntheticEvent,
        isExpanded: boolean
    ) => {
        setExpanded(isExpanded);
    };

    const theme = useTheme();
    const [filters, setFilters] = useState<Filters>(defaultFilterOptions);

    const handleChange =
        (key: string) => (event: SelectChangeEvent<string[]>) => {
            const {
                target: { value },
            } = event;

            const values =
                // On autofill we get a stringified value.
                typeof value === "string" ? value.split(",") : value;

            const updatedFilters = {
                ...filters,
                [key]: values,
            };

            setFilters(updatedFilters);
            handleFiltersChange(key, updatedFilters);
        };

    return (
        <Accordion expanded={expanded} onChange={handleExpandedChange}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="filters-content"
                id="filters-header"
            >
                <Typography variant="h5" sx={{ width: "33%", flexShrink: 0 }}>
                    {expanded ? "Hide Filters" : "Show Filters"}
                </Typography>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={3}>
                    {Object.entries(filters).map(([key, values]) => {
                        return (
                            <Grid item xs={4} key={key}>
                                <FormControl sx={{ m: 1, width: "100%" }}>
                                    <InputLabel
                                        id={`${key}-label`}
                                        sx={{ textTransform: "capitalize" }}
                                    >
                                        {key}
                                    </InputLabel>
                                    <Select
                                        labelId={`${key}-label`}
                                        id={`${key}`}
                                        multiple
                                        value={values}
                                        onChange={handleChange(key)}
                                        input={
                                            <OutlinedInput
                                                id={`${key}-chip`}
                                                label={key}
                                            />
                                        }
                                        renderValue={(selected) => (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: 0.5,
                                                }}
                                            >
                                                {selected.map((value) => (
                                                    <Chip
                                                        key={value}
                                                        label={value}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                        MenuProps={MenuProps}
                                    >
                                        {filterOptionsValues[
                                            key as keyof Filters
                                        ].map((optionVal) => (
                                            <MenuItem
                                                key={optionVal}
                                                value={optionVal}
                                                style={getStyles(
                                                    optionVal,
                                                    filters[
                                                        key as keyof Filters
                                                    ],
                                                    theme
                                                )}
                                            >
                                                {optionVal}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        );
                    })}
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
};

export default TimetableFilters;
