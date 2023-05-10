import React from "react";
import CalendarViewMonthRoundedIcon from "@mui/icons-material/CalendarViewMonthRounded";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DateRangeRoundedIcon from "@mui/icons-material/DateRangeRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import MeetingRoomRoundedIcon from "@mui/icons-material/MeetingRoomRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";

import { AppRoutes } from "@ta/ui";
import { UserRole } from "@ta/shared/utils";

import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import GenerateTimetable from "./pages/GenerateTimetable";
import Home from "./pages/Home";
import Login from "./pages/Login";
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
        private: false,
        allowedUsers: [UserRole.Admin, UserRole.Coordinator, UserRole.Guest],
        children: [
            {
                path: "/login",
                element: <Login />,
                name: "Login",
                icon: <LoginRoundedIcon />,
                hidden: true,
                private: false,
                allowedUsers: [
                    UserRole.Admin,
                    UserRole.Coordinator,
                    UserRole.Guest,
                ],
            },
            {
                path: "/",
                element: <Home />,
                name: "Home",
                icon: <HomeRoundedIcon />,
                hidden: true,
                private: true,
                allowedUsers: [UserRole.Admin, UserRole.Coordinator],
            },
            {
                path: "/uploadCourses",
                element: <UploadCourses />,
                name: "Upload Courses",
                icon: <MenuBookRoundedIcon />,
                hidden: false,
                private: true,
                allowedUsers: [UserRole.Admin, UserRole.Coordinator],
            },
            {
                path: "/uploadRooms",
                element: <UploadRooms />,
                name: "Upload Rooms",
                icon: <MeetingRoomRoundedIcon />,
                hidden: false,
                private: true,
                allowedUsers: [UserRole.Admin, UserRole.Coordinator],
            },
            {
                path: "/uploadSlots",
                element: <UploadSlots />,
                name: "Upload Slots",
                icon: <DateRangeRoundedIcon />,
                hidden: false,
                private: true,
                allowedUsers: [UserRole.Admin, UserRole.Coordinator],
            },
            {
                path: "/generateTimetable",
                element: <GenerateTimetable />,
                name: "Generate Timetable",
                icon: <CalendarViewMonthRoundedIcon />,
                hidden: false,
                private: true,
                allowedUsers: [UserRole.Admin, UserRole.Coordinator],
            },
            {
                path: "/timetable",
                element: <Timetable />,
                name: "Timetable",
                icon: <CalendarViewMonthRoundedIcon />,
                hidden: true,
                private: true,
                allowedUsers: [
                    UserRole.Admin,
                    UserRole.Coordinator,
                    UserRole.Guest,
                ],
            },
        ],
    },
];

const transformRoutes = (routes: AppRoutes): AppRoutes => {
    return routes.map((route) => {
        return {
            ...route,
            element: route.private ? (
                <PrivateRoute allowedUsers={route.allowedUsers}>
                    {route.element}
                </PrivateRoute>
            ) : (
                route.element
            ),
            ...(route.children && {
                children: transformRoutes(route.children),
            }),
        };
    });
};

export default transformRoutes(routes);
