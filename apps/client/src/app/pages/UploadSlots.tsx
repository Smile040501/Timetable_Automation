import React, { useMemo } from "react";

import Grid from "@mui/material/Grid";

import { Interval } from "@ta/shared/models";
import { SlotAsJSON, StringifiedValues } from "@ta/shared/utils";
import { JSONTable, UploadJSON } from "@ta/ui";

import { uploadSlots } from "../redux/actions";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { makeSlotsSelector } from "../redux/selectors";

const UploadSlots: React.FC = () => {
    const dispatch = useAppDispatch();
    const slotsSelector = useMemo(makeSlotsSelector, []);
    const slots = useAppSelector((state) => slotsSelector(state));

    const handleChange = (slots: SlotAsJSON[]) => {
        dispatch(uploadSlots(slots));
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <UploadJSON<SlotAsJSON>
                    buttonText="Upload Slots"
                    onUpload={handleChange}
                />
            </Grid>
            <Grid item xs={12}>
                <JSONTable<StringifiedValues<SlotAsJSON>>
                    data={slots.map((slot) => ({
                        ...slot,
                        dayTime: slot.dayTime
                            .map((dt) => {
                                const [startHours, startMinutes] =
                                    dt[1].start.split(":");
                                const [endHours, endMinutes] =
                                    dt[1].end.split(":");
                                return `${dt[0]} | ${Interval.getString(
                                    +startHours,
                                    +startMinutes
                                )} - ${Interval.getString(
                                    +endHours,
                                    +endMinutes
                                )} `;
                            })
                            .join("\n"),
                    }))}
                />
            </Grid>
        </Grid>
    );
};

export default UploadSlots;
