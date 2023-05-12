import React, { useState } from "react";

import { styled } from "@mui/material/styles";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Typography from "@mui/material/Typography";

import type { StringifiedValues } from "@ta/shared/utils";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
        minWidth: 100,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        minWidth: 100,
    },
}));

interface TableProps<T> {
    data: T[];
}

export const JSONTable = <T extends StringifiedValues<T>>({
    data,
}: TableProps<T>) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return data.length !== 0 ? (
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table
                    stickyHeader
                    sx={{ minWidth: 100 }}
                    aria-label="data table"
                >
                    <TableHead>
                        <TableRow>
                            {Object.keys(data[0]).map((column, i) => (
                                <StyledTableCell
                                    key={i}
                                    align="center"
                                    sx={{ textTransform: "capitalize" }}
                                >
                                    {column}
                                </StyledTableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data
                            .slice(
                                page * rowsPerPage,
                                page * rowsPerPage + rowsPerPage
                            )
                            .map((row, rowIdx) => {
                                return (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={rowIdx}
                                    >
                                        {Object.values(row).map(
                                            (value, colIdx) => {
                                                return (
                                                    <TableCell
                                                        key={colIdx}
                                                        align="center"
                                                        sx={{
                                                            whiteSpace:
                                                                "pre-wrap",
                                                        }}
                                                    >
                                                        {value as string}
                                                    </TableCell>
                                                );
                                            }
                                        )}
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    ) : (
        <Paper
            sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                height: 200,
                width: 350,
                mx: "auto",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
            }}
        >
            <Typography component="p" variant="h4">
                No Data Uploaded
            </Typography>
        </Paper>
    );
};
