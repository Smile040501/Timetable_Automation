import React, { ReactNode } from "react";
import moment, { Duration as MomentDuration, Moment } from "moment";
import { SxProps, styled } from "@mui/material/styles";
import { v4 as uuidv4 } from "uuid";

import Table, { TableProps } from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, {
    TableCellProps,
    tableCellClasses,
} from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        borderLeft: `1px solid ${theme.palette.common.white}`,
        borderRight: `1px solid ${theme.palette.common.white}`,
        color: theme.palette.common.white,
        minWidth: 100,
        textAlign: "center",
    },
    [`&.${tableCellClasses.body}`]: {
        borderLeft: "1px solid rgb(181, 181, 181)",
        borderRight: "1px solid rgb(181, 181, 181)",
        fontSize: 14,
        minWidth: 100,
        textAlign: "center",
        "&:first-of-type": {
            borderLeft: "1px solid rgb(224, 224, 224)",
            borderRight: "1px solid rgb(224, 224, 224)",
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
        },
    },
}));

export interface DayTimeCellEvent {
    cellStyles?: SxProps;
    cellProps?: TableCellProps;
    cellKey?: string;
    end: string;
    start: string;
    text: ReactNode;
}

export interface DayTimetableData {
    events: DayTimeCellEvent[];
    name: string;
}

interface DayTimetableDefaultProps {
    // Return object's height as number of rows
    calcCellHeight?: (
        day: DayTimeCellEvent,
        defaultInterval?: MomentDuration
    ) => number;
    // Timetable caption
    caption?: string;
    // Returns table-wide unique key for data cell element
    cellKey?: (day: DayTimeCellEvent) => ReactNode;
    // Whether to display table headers or not
    hideHeaders?: boolean;
    // Whether to display times column or not
    hideTimes?: boolean;
    // The moment duration object for interval
    interval?: MomentDuration;
    //  Whether a cell should be painted
    isActive?: (
        day: DayTimeCellEvent,
        step: number,
        defaultMinTime?: Moment,
        defaultInterval?: MomentDuration
    ) => boolean;
    // Maximum Timetable end time
    maxTime?: Moment;
    // Minimum Timetable start time
    minTime?: Moment;
    // Returns the number of rows
    getRowNum?: (
        defaultMinTime?: Moment,
        defaultMaxTime?: Moment,
        defaultInterval?: MomentDuration
    ) => number;
    // Return text to be printed in the cell
    showCell?: (day: DayTimeCellEvent) => ReactNode;
    // Return text to be printed in the row header
    showHeader?: (day: DayTimetableData) => string;
    // Return text to be printed in left-most column
    showTime?: (
        step: number,
        fmtStr?: string,
        defaultMinTime?: Moment,
        defaultInterval?: MomentDuration
    ) => string;
    // Default Table Props
    tableProps?: TableProps;
    // Times column header text
    timeText?: string;
}

interface DayTimetableRequiredProps {
    // The timetable data
    data: DayTimetableData[];
}

interface DayTimetableProps
    extends DayTimetableDefaultProps,
        DayTimetableRequiredProps {}

interface GridCellInfo {
    first: boolean;
    height: number;
    info: DayTimeCellEvent;
}

const defaultDayTimetableProps = (() => {
    const intervalMinutes = 5;
    const interval = moment.duration(intervalMinutes, "minutes");
    const minTime = moment("08:00", "HH:mm");
    const maxTime = moment("18:00", "HH:mm");

    const defaultProps: Required<DayTimetableDefaultProps> = {
        calcCellHeight: (dt: DayTimeCellEvent, defaultInterval = interval) => {
            return (
                // unix() returns in seconds
                // ((t1.unix() - t2.unix()) * 1000)
                Math.ceil(
                    moment(dt.end, "HH:mm").diff(moment(dt.start, "HH:mm")) /
                        defaultInterval.asMilliseconds()
                ) + 1
            );
        },
        caption: "",
        cellKey: (day: DayTimeCellEvent) => day.cellKey!,
        hideHeaders: false,
        hideTimes: false,
        interval,
        isActive: (
            dt: DayTimeCellEvent,
            rowIdx: number,
            defaultMinTime = minTime,
            defaultInterval = interval
        ) => {
            const current = moment(defaultMinTime).add(
                defaultInterval.asSeconds() * rowIdx,
                "seconds"
            );

            return (
                moment(dt.start, "HH:mm") <= current &&
                current <= moment(dt.end, "HH:mm")
            );
        },
        maxTime,
        minTime,
        getRowNum: (
            defaultMinTime = minTime,
            defaultMaxTime = maxTime,
            defaultInterval = interval
        ) => {
            return (
                Math.ceil(
                    defaultMaxTime.diff(defaultMinTime) /
                        defaultInterval.asMilliseconds()
                ) + 1
            );
        },
        showCell: (dt: DayTimeCellEvent) => dt.text,
        showHeader: (dt: DayTimetableData) => dt.name,
        showTime: (
            rowIdx: number,
            fmtStr = "hh:mm A",
            defaultMinTime = minTime,
            defaultInterval = interval
        ) => {
            const start = moment(defaultMinTime).add(
                defaultInterval.asSeconds() * rowIdx,
                "seconds"
            );

            return `${start.format(fmtStr)}`;
        },
        tableProps: {
            stickyHeader: true,
            sx: {
                minWidth: 100,
            },
        },
        timeText: "Times",
    };

    return defaultProps;
})();

const DayTimetable: React.FC<DayTimetableProps> = (props) => {
    const {
        calcCellHeight,
        caption,
        cellKey,
        data,
        hideHeaders,
        hideTimes,
        isActive,
        getRowNum,
        showCell,
        showHeader,
        showTime,
        tableProps,
        timeText,
    } = {
        ...defaultDayTimetableProps,
        ...props,
    };

    // Number of columns other than the times column
    const colNum = data.length + (hideTimes ? 0 : 1);
    const rowNum = getRowNum();

    const grid: GridCellInfo[][][] = [];
    const maxEventsInColumns: number[] = data.map((d) => 0);

    for (let row = 0; row < rowNum; ++row) {
        grid[row] = [];
        for (let col = 0; col < colNum - 1; ++col) {
            grid[row][col] = [];
        }
    }

    for (let col = 0; col < colNum - 1; ++col) {
        for (const event of data[col].events) {
            if (!event.cellKey) {
                event.cellKey = uuidv4();
            }
        }
    }

    // Go to each day column in timetable
    for (let col = 0; col < colNum - 1; ++col) {
        const isFirstEvent = new Map<any, boolean>();
        // Go to each time row in timetable
        for (let row = 0; row < rowNum; ++row) {
            // Go to all the events on that day
            for (const event of data[col].events) {
                if (isActive(event, row)) {
                    let isFirst = false;
                    if (!isFirstEvent.get(cellKey(event))) {
                        isFirst = true;
                        isFirstEvent.set(cellKey(event), true);
                    }
                    grid[row][col].push({
                        first: isFirst,
                        height: calcCellHeight(event),
                        info: event,
                    });
                }
            }

            maxEventsInColumns[col] = Math.max(
                maxEventsInColumns[col],
                grid[row][col].length
            );
        }
    }

    // Table Headers other than the times column
    const headers = data.map((day, colIdx) => (
        <StyledTableCell key={colIdx} colSpan={maxEventsInColumns[colIdx]}>
            {showHeader(day)}
        </StyledTableCell>
    ));

    const isRowUseful = (rowTime: string, data: DayTimetableData[]) => {
        return true;
        let isUseful = false;
        data.forEach((col) => {
            col.events.forEach((event) => {
                if (rowTime === event.start || rowTime === event.end) {
                    isUseful = true;
                }
            });
        });
        return isUseful;
    };

    const getEventCell = (
        events: GridCellInfo[],
        rowIdx: number,
        colIdx: number,
        maxEventsInColumn: number
    ) => {
        if (maxEventsInColumn === 0) {
            return (
                <StyledTableCell key={`${rowIdx}-${colIdx}`} sx={{ p: 0 }} />
            );
        }
        const cells: JSX.Element[] = [];
        let eventIdx = 0;
        if (events.length !== 0) {
            events.forEach((event) => {
                if (event.first) {
                    cells.push(
                        <StyledTableCell
                            key={`${rowIdx}-${colIdx}-${eventIdx}`}
                            rowSpan={event.height}
                            {...event.info.cellProps}
                            sx={{
                                p: 0,
                                ...event.info.cellStyles,
                            }}
                        >
                            {showCell(event.info)}
                        </StyledTableCell>
                    );
                }
                ++eventIdx;
            });
        }
        for (; eventIdx < maxEventsInColumn; ++eventIdx) {
            cells.push(
                <StyledTableCell
                    key={`${rowIdx}-${colIdx}-${eventIdx}`}
                    sx={{ p: 0 }}
                />
            );
        }
        return cells;
    };

    return (
        <Paper sx={{ width: "100%" }}>
            <TableContainer sx={{ maxHeight: 630, width: "100%" }}>
                <Table {...tableProps}>
                    {!hideHeaders && (
                        <TableHead>
                            {!!caption && (
                                <TableRow>
                                    <StyledTableCell
                                        colSpan={colNum}
                                        key="table-caption"
                                    >
                                        {caption}
                                    </StyledTableCell>
                                </TableRow>
                            )}
                            <TableRow>
                                {!hideTimes && (
                                    <StyledTableCell>
                                        {timeText}
                                    </StyledTableCell>
                                )}
                                {headers}
                            </TableRow>
                        </TableHead>
                    )}
                    <TableBody>
                        {grid.map((row, rowIdx) => {
                            const rowTime = showTime(rowIdx, "HH:mm");
                            const showRow = isRowUseful(rowTime, data);

                            return (
                                <TableRow
                                    key={rowIdx}
                                    sx={{ height: showRow ? 50 : 2 }}
                                >
                                    {!hideTimes && (
                                        <StyledTableCell
                                            sx={{ p: showRow ? 1 : 0 }}
                                        >
                                            {showRow && showTime(rowIdx)}
                                        </StyledTableCell>
                                    )}
                                    {row.map((events, colIdx) => {
                                        return getEventCell(
                                            events,
                                            rowIdx,
                                            colIdx,
                                            maxEventsInColumns[colIdx]
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default DayTimetable;
