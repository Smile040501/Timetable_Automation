/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

interface UploadJSONProps<T> {
    buttonText: string;
    onUpload(data: T[]): void;
}

export const UploadJSON = <T,>({
    buttonText,
    onUpload,
}: UploadJSONProps<T>) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const fileReader = new FileReader();
            fileReader.readAsText(e.target.files![0], "UTF-8");
            fileReader.onload = (e) => {
                if (e.target?.result && typeof e.target.result === "string") {
                    onUpload(JSON.parse(e.target.result));
                }
            };
        }
    };

    return (
        <Paper
            sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 150,
                width: 250,
                mx: "auto",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
            }}
        >
            <Button variant="contained" component="label" sx={{ width: 150 }}>
                {buttonText}
                <input
                    hidden
                    accept="application/JSON"
                    type="file"
                    onChange={handleChange}
                />
            </Button>
        </Paper>
    );
};
