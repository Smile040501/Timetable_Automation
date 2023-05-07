import React from "react";

import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

const Home: React.FC = () => {
    return (
        <Paper
            sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 240,
                justifyContent: "center",
                textAlign: "center",
            }}
        >
            <Typography component="p" variant="h4">
                Upload the required data and
                <br /> select the algorithm to generate the timetable
            </Typography>
        </Paper>
    );
};

export default Home;
