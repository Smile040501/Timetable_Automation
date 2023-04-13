import React, { useMemo } from "react";

import Grid from "@mui/material/Grid";

import JSONTable from "../components/JSONTable";
import UploadJSON from "../components/UploadJSON";
import { uploadRooms } from "../redux/actions";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { makeRoomsSelector } from "../redux/selectors";
import { RoomsAsJSON, StringifiedValues } from "../utils/interfaces";

const UploadRooms: React.FC = () => {
    const dispatch = useAppDispatch();
    const roomsSelector = useMemo(makeRoomsSelector, []);
    const rooms = useAppSelector((state) => roomsSelector(state));

    const handleChange = (rooms: RoomsAsJSON[]) => {
        dispatch(uploadRooms(rooms));
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <UploadJSON<RoomsAsJSON>
                    buttonText="Upload Rooms"
                    onUpload={handleChange}
                />
            </Grid>
            <Grid item xs={12}>
                <JSONTable<StringifiedValues<RoomsAsJSON>>
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
