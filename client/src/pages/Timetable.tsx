import React, { ReactNode, useMemo, useState, useEffect } from "react";
import { SxProps } from "@mui/material/styles";
import cloneDeep from "lodash/cloneDeep";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";

import DayTimetable, { DayTimetableData } from "../components/DayTimetable";
import SlotDetails from "../components/SlotDetails";
import TimetableFilters from "../components/TimetableFilters";

import Class from "../algorithms/models/class";
import Data from "../algorithms/models/data";
import Slot from "../algorithms/models/slot";
import Interval from "../algorithms/utils/interval";
import { CourseType, LectureType, WeekDay } from "../algorithms/utils/enums";
import { getEnumKeys } from "../algorithms/utils/utils";

import { useAppSelector } from "../redux/hooks";
import { makeClassesSelector, makeDataSelector } from "../redux/selectors";
import { Filters } from "../interfaces";

// const times: DayTimetableData[] = [
//     {
//         name: "Monday",
//         events: [
//             {
//                 start: "08:00",
//                 end: "08:50",
//                 text: getEventText(
//                     <div>
//                         <h3>Doctor Appointment</h3>
//                         <b>Dr. Nick</b>
//                         <br />
//                         1-800-DOCTORB
//                         <br />
//                         The 'B' is for bargain!
//                     </div>,
//                     (e) => console.log("Hi")
//                 ),
//                 cellStyles: {
//                     ...defaultEventCellStyles,
//                 },
//             },
//             {
//                 start: "08:10",
//                 end: "09:00",
//                 text: getEventText("Arrow", (e) => console.log("Hi")),
//                 cellStyles: {
//                     ...defaultEventCellStyles,
//                 },
//             },
//             {
//                 start: "09:45",
//                 end: "10:30",
//                 text: getEventText("Hi", (e) => console.log("Hi")),
//                 cellStyles: {
//                     ...defaultEventCellStyles,
//                 },
//             },
//             {
//                 start: "09:00",
//                 end: "15:30",
//                 text: getEventText("Hi", (e) => console.log("Hi")),
//                 cellStyles: {
//                     ...defaultEventCellStyles,
//                 },
//             },
//         ],
//     },
//     {
//         name: "Tuesday",
//         events: [
//             {
//                 start: "08:20",
//                 end: "08:45",
//                 text: getEventText("Meet with my lawyers.", (e) =>
//                     console.log("Hi")
//                 ),
//                 cellStyles: {
//                     ...defaultEventCellStyles,
//                 },
//             },
//         ],
//     },
//     {
//         name: "Wednesday",
//         events: [
//             {
//                 start: "09:00",
//                 end: "09:30",
//                 text: getEventText(
//                     "I am doing something from 4:30-5:30pm on this date.",
//                     (e) => console.log("Hi")
//                 ),
//                 cellStyles: {
//                     ...defaultEventCellStyles,
//                     whiteSpace: "normal",
//                     wordWrap: "break-word",
//                 },
//             },
//             {
//                 start: "09:15",
//                 end: "11:45",
//                 text: getEventText(
//                     "Goodbye … I never thought it would come to this. But here we are.",
//                     (e) => console.log("Hi")
//                 ),
//                 cellStyles: {
//                     ...defaultEventCellStyles,
//                 },
//             },
//         ],
//     },
//     {
//         name: "Thursday",
//         events: [
//             {
//                 start: "15:00",
//                 end: "16:00",
//                 text: getEventText("Another thing.", (e) => console.log("Hi")),
//                 cellStyles: {
//                     ...defaultEventCellStyles,
//                 },
//             },
//         ],
//     },
//     {
//         name: "Friday",
//         events: [
//             {
//                 start: "08:00",
//                 end: "09:00",
//                 text: getEventText("Another thing.", (e) => console.log("Hi")),
//                 cellStyles: {
//                     ...defaultEventCellStyles,
//                 },
//             },
//         ],
//     },
// ];

const generateRandomColor = () => {
    const hex = Math.floor(Math.random() * 0xffffff);
    const color = "#" + hex.toString(16);
    return color;
};

const Timetable: React.FC = () => {
    const [classes, setClasses] = useState<[Class, Interval, Slot][]>([]);
    const [displayedClasses, setDisplayedClasses] = useState<Class[]>([]);
    const [weekDay, setWeekDay] = useState("");
    const [slotColors] = useState(new Map<string, string>());

    const generatedClassesSelector = useMemo(makeClassesSelector, []);
    const algorithmDataSelector = useMemo(makeDataSelector, []);

    const generatedClasses = useAppSelector(generatedClassesSelector);
    const algorithmData = useAppSelector(algorithmDataSelector);

    const defaultEventCellStyles: SxProps = {
        height: 0,
    };

    const getEventText = (
        text: ReactNode,
        onClickHandler: React.MouseEventHandler<HTMLButtonElement>,
        color?: string
    ) => {
        return (
            <div style={{ height: "100%" }}>
                <Button
                    fullWidth
                    sx={{
                        height: "100%",
                        flexGrow: 1,
                        backgroundColor: color,
                        "&:hover": {
                            backgroundColor: color,
                        },
                        fontSize: 20,
                    }}
                    variant="contained"
                    onClick={onClickHandler}
                >
                    {text}
                </Button>
            </div>
        );
    };

    const getTimetableData = (
        generatedClasses: Class[]
    ): DayTimetableData[] => {
        const data: DayTimetableData[] = [];
        const weekDays = getEnumKeys(WeekDay);
        const [schedule] = Class.getWeekdayWiseSchedule(generatedClasses);

        weekDays.forEach((weekDay, weekIdx) => {
            data.push({
                name: weekDay,
                events: [],
            });

            schedule[weekIdx].forEach((cellData) => {
                const cellEvents: {
                    [slot: string]: [Class, Interval, Slot][];
                } = {};
                cellData.forEach((event) => {
                    const [, , slot] = event;
                    if (!cellEvents[slot.name]) {
                        cellEvents[slot.name] = [];
                    }
                    cellEvents[slot.name].push(event);
                });

                Object.keys(cellEvents).forEach((slot) => {
                    const classes = cellEvents[slot];
                    const interval = classes[0][1];

                    if (!slotColors.has(slot)) {
                        slotColors.set(slot, generateRandomColor());
                    }

                    data[weekIdx].events.push({
                        start: Interval.getString(
                            interval.startHours,
                            interval.startMinutes,
                            Interval.exportOptions
                        ),
                        end: Interval.getString(
                            interval.endHours,
                            interval.endMinutes,
                            Interval.exportOptions
                        ),
                        text: getEventText(
                            slot,
                            (e) => {
                                setClasses(classes);
                                setWeekDay(data[weekIdx].name);
                            },
                            slotColors.get(slot)!
                        ),
                        cellStyles: {
                            ...defaultEventCellStyles,
                        },
                    });
                });
            });
        });
        return data;
    };

    const getFilterOptionsValues = (data?: Data): Filters => {
        if (!data) {
            return {
                courses: [],
                rooms: [],
                faculties: [],
                slots: [],
                departments: [],
                courseTypes: [],
                lectureTypes: [],
                campuses: [],
            };
        }
        return {
            courses: data.courses.map(
                (course) => `${course.code} - ${course.name}`
            ),
            rooms: data.rooms.map((room) => `${room.name}, ${room.campus}`),
            faculties: data.faculties.map((faculty) => faculty.name),
            slots: data.slots.map((slot) => slot.name),
            departments: [
                ...data.departmentsWithConflicts,
                ...data.departmentsWithNoConflicts,
            ],
            courseTypes: getEnumKeys(CourseType),
            lectureTypes: getEnumKeys(LectureType),
            campuses: ["Ahalia", "Nila"],
        };
    };

    const handleFiltersChange = (key: string, filterOptions: Filters) => {
        let resultantClasses: Class[] = cloneDeep(generatedClasses);
        for (const key of Object.keys(filterOptions)) {
            const values = filterOptions[key as keyof Filters] as string[];
            if (values.length === 0) continue;
            switch (key as keyof Filters) {
                case "courses": {
                    resultantClasses = resultantClasses.filter(
                        (cls) =>
                            values.indexOf(
                                `${cls.course.code} - ${cls.course.name}`
                            ) !== -1
                    );
                    break;
                }
                case "rooms": {
                    resultantClasses = resultantClasses.filter(
                        (cls) =>
                            values.indexOf(
                                `${cls.room!?.name}, ${cls.room!?.campus}`
                            ) !== -1
                    );
                    break;
                }
                case "faculties": {
                    resultantClasses = resultantClasses.filter((cls) => {
                        let hasFaculty = false;
                        cls.course.faculties.forEach((faculty) => {
                            if (values.indexOf(faculty.name) !== -1) {
                                hasFaculty = true;
                            }
                        });
                        return hasFaculty;
                    });
                    break;
                }
                case "slots": {
                    resultantClasses = resultantClasses.filter((cls) => {
                        let hasSlot = false;
                        cls.slots.forEach((slot) => {
                            if (values.indexOf(slot.name) !== -1) {
                                hasSlot = true;
                            }
                        });
                        return hasSlot;
                    });
                    break;
                }
                case "departments": {
                    resultantClasses = resultantClasses.filter(
                        (cls) => values.indexOf(cls.course.department) !== -1
                    );
                    break;
                }
                case "courseTypes": {
                    resultantClasses = resultantClasses.filter(
                        (cls) => values.indexOf(cls.course.courseType) !== -1
                    );
                    break;
                }
                case "lectureTypes": {
                    resultantClasses = resultantClasses.filter(
                        (cls) => values.indexOf(cls.course.lectureType) !== -1
                    );
                    break;
                }
                case "campuses": {
                    resultantClasses = resultantClasses.filter(
                        (cls) => values.indexOf(cls.room!?.campus) !== -1
                    );
                    break;
                }
            }
        }
        setDisplayedClasses(resultantClasses);
    };

    useEffect(() => {
        setDisplayedClasses(generatedClasses);
    }, [generatedClasses]);

    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <TimetableFilters
                    filterOptionsValues={getFilterOptionsValues(algorithmData)}
                    handleFiltersChange={handleFiltersChange}
                />
            </Grid>
            <Grid item xs={12}>
                <DayTimetable data={getTimetableData(displayedClasses)} />
            </Grid>
            <Grid item xs={12}>
                <SlotDetails classes={classes} weekDay={weekDay as WeekDay} />
            </Grid>
        </Grid>
    );
};

export default Timetable;