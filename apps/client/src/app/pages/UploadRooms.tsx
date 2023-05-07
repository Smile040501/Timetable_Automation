import React, { useMemo } from "react";

import Grid from "@mui/material/Grid";

import { RoomAsJSON, StringifiedValues } from "@ta/shared/utils";
import { JSONTable, UploadJSON } from "@ta/ui";

import { uploadRooms } from "../redux/actions";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { makeRoomsSelector } from "../redux/selectors";

const UploadRooms: React.FC = () => {
    const dispatch = useAppDispatch();
    const roomsSelector = useMemo(makeRoomsSelector, []);
    const rooms = useAppSelector((state) => roomsSelector(state));

    const handleChange = (rooms: RoomAsJSON[]) => {
        dispatch(uploadRooms(rooms));
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <UploadJSON<RoomAsJSON>
                    buttonText="Upload Rooms"
                    onUpload={handleChange}
                />
            </Grid>
            <Grid item xs={12}>
                <JSONTable<StringifiedValues<RoomAsJSON>>
                    data={rooms.map((room) => ({
                        ...room,
                        capacity: room.capacity.toString(),
                    }))}
                />
            </Grid>
        </Grid>
    );
};

export default UploadRooms;
