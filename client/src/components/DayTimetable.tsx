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

const StyledTableCell = styled(TableCell)<{
    displayverticaldays: "true" | "false";
}>(({ theme, displayverticaldays }) => {
    const displayVerticalDays = displayverticaldays === "true";
    return {
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.black,
            border: `2px solid ${theme.palette.common.white}`,
            color: theme.palette.common.white,
            textAlign: "center",
        },
        [`&.${tableCellClasses.body}`]: {
            border: `1px solid rgb(225, 225, 225)`,
            [`${displayVerticalDays ? "borderTop" : "borderLeft"}`]:
                "2px solid rgb(181, 181, 181)",
            [`${displayVerticalDays ? "borderBottom" : "borderRight"}`]:
                "2px solid rgb(181, 181, 181)",
            fontSize: 14,
            textAlign: "center",
        },
    };
});

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
        defaultInterval: MomentDuration,
        timesSet?: string[]
    ) => number;
    // Timetable caption
    caption?: ReactNode;
    // Returns table-wide unique key for data cell element
    cellKey?: (day: DayTimeCellEvent) => ReactNode;
    // Whether to collapse not useful rows
    collapseTimesColumn?: boolean;
    // Whether to display days as the left headers
    displayVerticalDays?: boolean;
    // Whether to display top table headers
    hideTopHeaders?: boolean;
    // Whether to display left table headers
    hideLeftHeaders?: boolean;
    // The moment duration object for interval
    interval?: MomentDuration;
    //  Whether a cell should be painted
    isActive?: (
        day: DayTimeCellEvent,
        step: number,
        defaultMinTime: Moment,
        defaultInterval: MomentDuration,
        timesSet?: string[]
    ) => boolean;
    // Maximum Timetable end time
    maxTime?: Moment;
    // Minimum Timetable start time
    minTime?: Moment;
    // Returns the number of rows
    getRowNum?: (
        defaultMinTime: Moment,
        defaultMaxTime: Moment,
        defaultInterval: MomentDuration,
        timesSet?: string[]
    ) => number;
    // Return text to be printed in the cell
    showCell?: (day: DayTimeCellEvent) => ReactNode;
    // Return text to be printed in the row header
    showHeader?: (day: DayTimetableData) => string;
    // Return text to be printed for times cell
    showTime?: (
        step: number,
        fmtStr: string,
        defaultMinTime: Moment,
        defaultInterval: MomentDuration,
        timesSet?: string[]
    ) => string;
    // Default Table Props
    tableProps?: TableProps;
    // Time format string
    timeFmtStr?: string;
    // Times cells header text
    timeText?: string;
    // Whether to use time values from data or not
    useDataTimes?: boolean;
}

interface DayTimetableRequiredProps {
    // The timetable data
    data: DayTimetableData[];
}

interface DayTimetableProps
    extends DayTimetableDefaultProps,
        DayTimetableRequiredProps {}

interface GridCellInfo {
    id: string;
    first: boolean;
    height: number;
    info: DayTimeCellEvent;
}

const getTimeStr12 = (withUnit = true) => `hh:mm${withUnit ? " A" : ""}`;
const timeStr24 = "HH:mm";

const defaultDayTimetableProps = (() => {
    const defaultIntervalMinutes = 5;
    const defaultInterval = moment.duration(defaultIntervalMinutes, "minutes");
    const defaultMinTime = moment("08:00", timeStr24);
    const defaultMaxTime = moment("18:00", timeStr24);
    const defaultFmtStr = getTimeStr12();

    const defaultProps: Required<DayTimetableDefaultProps> = {
        calcCellHeight: (
            dt: DayTimeCellEvent,
            interval: MomentDuration,
            timesSet: string[] = []
        ) => {
            return timesSet.length === 0
                ? // unix() returns in seconds
                  // ((t1.unix() - t2.unix()) * 1000)
                  Math.ceil(
                      moment(dt.end, timeStr24).diff(
                          moment(dt.start, timeStr24)
                      ) / interval.asMilliseconds()
                  ) + 1
                : timesSet.indexOf(dt.end) - timesSet.indexOf(dt.start) + 1;
        },
        caption: "",
        cellKey: (day: DayTimeCellEvent) => day.cellKey!,
        collapseTimesColumn: false,
        displayVerticalDays: true,
        hideTopHeaders: false,
        hideLeftHeaders: false,
        interval: defaultInterval,
        isActive: (
            dt: DayTimeCellEvent,
            step: number,
            minTime: Moment,
            interval: MomentDuration,
            timesSet: string[] = []
        ) => {
            const current =
                timesSet.length === 0
                    ? moment(minTime).add(
                          interval.asSeconds() * step,
                          "seconds"
                      )
                    : moment(timesSet[step], timeStr24);

            return (
                moment(dt.start, timeStr24) <= current &&
                current <= moment(dt.end, timeStr24)
            );
        },
        maxTime: defaultMaxTime,
        minTime: defaultMinTime,
        getRowNum: (
            minTime: Moment,
            maxTime: Moment,
            interval: MomentDuration,
            timesSet: string[] = []
        ) => {
            return timesSet.length === 0
                ? Math.ceil(maxTime.diff(minTime) / interval.asMilliseconds()) +
                      1
                : timesSet.length;
        },
        showCell: (dt: DayTimeCellEvent) => dt.text,
        showHeader: (dt: DayTimetableData) => dt.name,
        showTime: (
            step: number,
            fmtStr: string,
            minTime: Moment,
            interval: MomentDuration,
            timesSet: string[] = []
        ) => {
            const start =
                timesSet.length === 0
                    ? moment(minTime).add(
                          interval.asSeconds() * step,
                          "seconds"
                      )
                    : moment(timesSet[step], timeStr24);

            return `${start.format(fmtStr)}`;
        },
        tableProps: {
            stickyHeader: true,
            sx: { minWidth: 100 },
        },
        timeFmtStr: defaultFmtStr,
        timeText: "Times",
        useDataTimes: false,
    };

    return defaultProps;
})();

const DayTimetable: React.FC<DayTimetableProps> = (props) => {
    const {
        calcCellHeight,
        caption,
        cellKey,
        collapseTimesColumn,
        data,
        displayVerticalDays,
        hideTopHeaders,
        hideLeftHeaders,
        interval,
        isActive,
        maxTime,
        minTime,
        getRowNum,
        showCell,
        showHeader,
        showTime,
        tableProps,
        timeFmtStr,
        timeText,
        useDataTimes,
    } = {
        ...defaultDayTimetableProps,
        ...props,
    };

    let timesSet: string[] = [];
    if (useDataTimes) {
        data.forEach((day) => {
            day.events.forEach((event) => {
                timesSet.push(event.start);
                timesSet.push(event.end);
            });
        });
        timesSet.sort();
        timesSet = [...new Set(timesSet)];
    }

    const numWeekDays = data.length;
    const numTimes = getRowNum(minTime, maxTime, interval, timesSet);

    // Times-WeekDay Grid
    const timesDayGrid: GridCellInfo[][][] = [];
    const dayTimesGrid: (GridCellInfo | null)[][][] = [];
    const maxConsecutiveEventsInDays: number[] = data.map((d) => 0);

    for (let row = 0; row < numTimes; ++row) {
        timesDayGrid[row] = [];
        dayTimesGrid[row] = [];
        for (let col = 0; col < numWeekDays; ++col) {
            timesDayGrid[row][col] = [];
            dayTimesGrid[row][col] = [];
        }
    }

    const eventKeys: Map<DayTimeCellEvent, ReactNode> = new Map();
    const gridCellIndexes: Map<DayTimeCellEvent, number> = new Map();

    // Go to each day column in timetable
    for (let col = 0; col < numWeekDays; ++col) {
        const isFirstEvent = new Map<any, boolean>();
        // Go to each time row in timetable
        for (let row = 0; row < numTimes; ++row) {
            const gridCells: GridCellInfo[] = [];
            // Go to all the events on that day
            for (const event of data[col].events) {
                let eventKey = eventKeys.get(event);
                if (!eventKey) {
                    eventKey = cellKey(event) || uuidv4();
                    eventKeys.set(event, eventKey);
                }
                if (isActive(event, row, minTime, interval, timesSet)) {
                    let isFirst = false;
                    if (!isFirstEvent.get(eventKey)) {
                        isFirst = true;
                        isFirstEvent.set(eventKey, true);
                    }
                    const gridCellInfo: GridCellInfo = {
                        id: eventKey.toString(),
                        first: isFirst,
                        height: calcCellHeight(event, interval, timesSet),
                        info: event,
                    };
                    timesDayGrid[row][col].push(gridCellInfo);
                    gridCells.push(gridCellInfo);
                }
            }

            maxConsecutiveEventsInDays[col] = Math.max(
                maxConsecutiveEventsInDays[col],
                timesDayGrid[row][col].length
            );

            if (displayVerticalDays) {
                const orderedGridCells: (GridCellInfo | null)[] = Array.from(
                    { length: maxConsecutiveEventsInDays[col] },
                    (_, i) => null
                );
                const nonFirstGridCells = gridCells.filter(
                    (gridCell) => !gridCell.first
                );
                nonFirstGridCells.forEach((gridCell) => {
                    const gridCellIdx = gridCellIndexes.get(gridCell.info)!;
                    orderedGridCells.splice(gridCellIdx, 1, gridCell);
                });

                const firstGridCells = gridCells.filter(
                    (gridCell) => gridCell.first
                );
                firstGridCells.forEach((gridCell) => {
                    let gridCellIdx = orderedGridCells.indexOf(null);
                    if (gridCellIdx !== -1) {
                        orderedGridCells.splice(gridCellIdx, 1, gridCell);
                    } else {
                        orderedGridCells.push(gridCell);
                        gridCellIdx = orderedGridCells.length - 1;
                    }
                    gridCellIndexes.set(gridCell.info, gridCellIdx);
                });

                dayTimesGrid[row][col] = orderedGridCells;
            }
        }
    }

    const isTimesCellUseful = (rowTime: string) => {
        if (!collapseTimesColumn || useDataTimes) return true;

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

    const getCaptionLength = () => {
        return (
            (hideLeftHeaders ? 0 : 1) +
            (displayVerticalDays
                ? numTimes
                : maxConsecutiveEventsInDays.reduce(
                      (prevVal, currVal) =>
                          prevVal + (currVal === 0 ? 1 : currVal),
                      0
                  ))
        );
    };

    // Table WeekDay Header
    const getDayHeader = (day: DayTimetableData, dayIdx: number) => {
        const spanProp: TableCellProps = {
            [displayVerticalDays ? "rowSpan" : "colSpan"]:
                maxConsecutiveEventsInDays[dayIdx] +
                (displayVerticalDays ? 1 : 0),
        };

        return (
            <StyledTableCell
                displayverticaldays={
                    displayVerticalDays.toString() as "true" | "false"
                }
                key={dayIdx}
                {...spanProp}
                sx={{
                    backgroundColor: "common.black",
                    color: "common.white",
                    border: "2px solid common.white",
                }}
            >
                {showHeader(day)}
            </StyledTableCell>
        );
    };

    const getDayHeaderRowCells = () => {
        return data.map((day, dayIdx) => getDayHeader(day, dayIdx));
    };

    // Table Times Header
    const getTimesHeader = (timesIdx: number) => {
        const rowTime24 = showTime(
            timesIdx,
            timeStr24,
            minTime,
            interval,
            timesSet
        );
        const isUseful = isTimesCellUseful(rowTime24);

        return [
            <StyledTableCell
                displayverticaldays={
                    displayVerticalDays.toString() as "true" | "false"
                }
                key={timesIdx}
                sx={{
                    p: isUseful ? 1 : 0,
                    minWidth: isUseful ? 100 : 0,
                    width: isUseful ? 100 : 2,
                    height: isUseful ? 50 : 0,
                    backgroundColor: "common.black",
                    color: "common.white",
                }}
            >
                {isUseful &&
                    showTime(timesIdx, timeFmtStr, minTime, interval, timesSet)}
            </StyledTableCell>,
            isUseful,
        ] as [JSX.Element, boolean];
    };

    const getTimesHeaderRowCells = () => {
        return timesDayGrid.map((row, rowIdx) => getTimesHeader(rowIdx)[0]);
    };

    const getHorizontalDaysEventCell = (
        events: GridCellInfo[],
        rowIdx: number,
        colIdx: number
    ) => {
        const maxEventsInDay = maxConsecutiveEventsInDays[colIdx];
        if (maxEventsInDay === 0) {
            return [
                <StyledTableCell
                    displayverticaldays={
                        displayVerticalDays.toString() as "true" | "false"
                    }
                    key={`${rowIdx}-${colIdx}`}
                    sx={{ p: 0 }}
                />,
            ];
        }

        const cells: JSX.Element[] = [];
        let eventIdx = 0;
        if (events.length !== 0) {
            events.forEach((event) => {
                if (event.first) {
                    cells.push(
                        <StyledTableCell
                            displayverticaldays={
                                displayVerticalDays.toString() as
                                    | "true"
                                    | "false"
                            }
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
        for (; eventIdx < maxEventsInDay; ++eventIdx) {
            cells.push(
                <StyledTableCell
                    displayverticaldays={
                        displayVerticalDays.toString() as "true" | "false"
                    }
                    key={`${rowIdx}-${colIdx}-${eventIdx}`}
                    sx={{ p: 0 }}
                />
            );
        }
        return cells;
    };

    const getHorizontalDaysRows = () => {
        return timesDayGrid.map((row, rowIdx) => {
            const [timesCell, isUseful] = getTimesHeader(rowIdx);

            return (
                <TableRow key={rowIdx} sx={{ height: isUseful ? 50 : 2 }}>
                    {!hideLeftHeaders && timesCell}
                    {row.map((events, colIdx) => {
                        return getHorizontalDaysEventCell(
                            events,
                            rowIdx,
                            colIdx
                        );
                    })}
                </TableRow>
            );
        });
    };

    const getVerticalDaysRows = () => {
        const rows: JSX.Element[] = [];
        for (let dayIdx = 0; dayIdx < numWeekDays; ++dayIdx) {
            const day = data[dayIdx];
            if (!hideLeftHeaders) {
                rows.push(
                    <TableRow key={dayIdx}>
                        {getDayHeader(day, dayIdx)}
                    </TableRow>
                );
            }
            for (let i = 0; i < maxConsecutiveEventsInDays[dayIdx]; ++i) {
                const rowCells: JSX.Element[] = [];
                for (let timesIdx = 0; timesIdx < numTimes; ++timesIdx) {
                    const event = dayTimesGrid[timesIdx][dayIdx][i];
                    if (!event) {
                        rowCells.push(
                            <StyledTableCell
                                displayverticaldays={
                                    displayVerticalDays.toString() as
                                        | "true"
                                        | "false"
                                }
                                key={`${dayIdx}-${timesIdx}-${i}`}
                                sx={{ p: 0 }}
                            />
                        );
                        continue;
                    }
                    if (event.first) {
                        rowCells.push(
                            <StyledTableCell
                                displayverticaldays={
                                    displayVerticalDays.toString() as
                                        | "true"
                                        | "false"
                                }
                                key={`${dayIdx}-${timesIdx}-${i}`}
                                colSpan={event.height}
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
                }
                rows.push(
                    <TableRow key={`${dayIdx}-${i}`}>{rowCells}</TableRow>
                );
            }
        }
        return rows;
    };

    return (
        <Paper sx={{ width: "100%" }}>
            <TableContainer sx={{ maxHeight: 630, width: "100%" }}>
                <Table {...tableProps}>
                    {!hideTopHeaders && (
                        <TableHead>
                            {!!caption && (
                                <TableRow>
                                    <StyledTableCell
                                        displayverticaldays={
                                            displayVerticalDays.toString() as
                                                | "true"
                                                | "false"
                                        }
                                        colSpan={getCaptionLength()}
                                        key="table-caption"
                                    >
                                        {caption}
                                    </StyledTableCell>
                                </TableRow>
                            )}
                            <TableRow>
                                {!hideLeftHeaders && (
                                    <StyledTableCell
                                        displayverticaldays={
                                            displayVerticalDays.toString() as
                                                | "true"
                                                | "false"
                                        }
                                        sx={{ height: 50 }}
                                    >
                                        {timeText}
                                    </StyledTableCell>
                                )}
                                {displayVerticalDays
                                    ? getTimesHeaderRowCells()
                                    : getDayHeaderRowCells()}
                            </TableRow>
                        </TableHead>
                    )}
                    <TableBody>
                        {displayVerticalDays
                            ? getVerticalDaysRows()
                            : getHorizontalDaysRows()}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default DayTimetable;
