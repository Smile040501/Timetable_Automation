import React from "react";
import CalendarViewMonthRoundedIcon from "@mui/icons-material/CalendarViewMonthRounded";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DateRangeRoundedIcon from "@mui/icons-material/DateRangeRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";

import { AppRoutes } from "@ta/ui";

import Dashboard from "./pages/Dashboard";
import GenerateTimetable from "./pages/GenerateTimetable";
import Home from "./pages/Home";
import UploadCourses from "./pages/UploadCourses";
import UploadRooms from "./pages/UploadRooms";
import UploadSlots from "./pages/UploadSlots";
import Timetable from "./pages/Timetable";

const routes: AppRoutes = [
    {
        element: <Dashboard />,
        name: "Dashboard",
        icon: <DashboardIcon />,
        hidden: true,
        children: [
            {
                path: "/",
                element: <Home />,
                name: "Home",
                icon: <HomeRoundedIcon />,
                hidden: true,
            },
            {
                path: "/uploadCourses",
                element: <UploadCourses />,
                name: "Upload Courses",
                icon: <MenuBookRoundedIcon />,
                hidden: false,
            },
            {
                path: "/uploadRooms",
                element: <UploadRooms />,
                name: "Upload Rooms",
                icon: <MeetingRoomRoundedIcon />,
                hidden: false,
            },
            {
                path: "/uploadSlots",
                element: <UploadSlots />,
                name: "Upload Slots",
                icon: <DateRangeRoundedIcon />,
                hidden: false,
            },
            {
                path: "/generateTimetable",
                element: <GenerateTimetable />,
                name: "Generate Timetable",
                icon: <CalendarViewMonthRoundedIcon />,
                hidden: false,
            },
            {
                path: "/timetable",
                element: <Timetable />,
                name: "Timetable",
                icon: <CalendarViewMonthRoundedIcon />,
                hidden: true,
            },
        ],
    },
];

export default routes;
