import React, { useEffect, useMemo } from "react";
import omit from "lodash/omit";

import Grid from "@mui/material/Grid";

import { Interval } from "@ta/shared/models";
import { SlotAsJSON, StringifiedValues } from "@ta/shared/utils";
import { JSONTable, UploadJSON } from "@ta/ui";

import { getSlots, uploadSlots } from "../redux/actions";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { makeSlotsSelector } from "../redux/selectors";

const UploadSlots: React.FC = () => {
    const dispatch = useAppDispatch();
    const slotsSelector = useMemo(makeSlotsSelector, []);
    const slots = useAppSelector((state) => slotsSelector(state));

    const handleChange = (slots: SlotAsJSON[]) => {
        dispatch(uploadSlots(slots));
    };

    useEffect(() => {
        dispatch(getSlots());
    }, [dispatch]);

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
                    data={slots.map(
                        (slot) =>
                            omit(
                                {
                                    ...slot,
                                    dayTime: slot.dayTime
                                        .map((dt) => {
                                            const [startHours, startMinutes] =
                                                dt[1].start.split(":");
                                            const [endHours, endMinutes] =
                                                dt[1].end.split(":");
                                            return `${
                                                dt[0]
                                            } | ${Interval.getString(
                                                +startHours,
                                                +startMinutes
                                            )} - ${Interval.getString(
                                                +endHours,
                                                +endMinutes
                                            )} `;
                                        })
                                        .join("\n"),
                                },
                                ["_id", "__v", "createdAt", "updatedAt", "id"]
                            ) as unknown as StringifiedValues<SlotAsJSON>
                    )}
                />
            </Grid>
        </Grid>
    );
};

export default UploadSlots;
