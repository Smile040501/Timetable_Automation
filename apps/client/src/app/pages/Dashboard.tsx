import React, { useMemo } from "react";
import intersection from "lodash/intersection";

import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";

import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import { AppRoutes, Dashboard as LibDashboard } from "@ta/ui";
import { AuthUserState } from "@ta/shared/models";

import routes from "../routes";
import { makeUserInfoSelector } from "../redux/selectors/authUser";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { authLogout } from "../redux/actions";

const Dashboard: React.FC = () => {
    const dispatch = useAppDispatch();

    const userInfoSelector = useMemo(makeUserInfoSelector, []);
    const userInfo = useAppSelector(userInfoSelector);

    const transformRoutes = (
        routes: AppRoutes,
        userInfo: AuthUserState
    ): AppRoutes => {
        return routes.map((route) => {
            return {
                ...route,
                ...(!route.hidden && {
                    hidden:
                        intersection(route.allowedUsers, userInfo.roles)
                            .length === 0,
                }),
                ...(route.children && {
                    children: transformRoutes(route.children, userInfo),
                }),
            };
        });
    };

    const handleLogout = () => {
        dispatch(authLogout());
    };

    return (
        <LibDashboard
            routes={transformRoutes(routes, userInfo)}
            showDrawer={!!userInfo.email}
            header={
                <Grid container spacing={3} sx={{ alignItems: "center" }}>
                    <Grid item xs={userInfo.email ? 6 : 12}>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1, textAlign: "center" }}
                        >
                            Timetable Generator
                        </Typography>
                    </Grid>
                    {!!userInfo.email && (
                        <Grid
                            item
                            container
                            xs={6}
                            spacing={2}
                            sx={{
                                justifyContent: "right",
                                alignItems: "center",
                            }}
                        >
                            <Grid item>
                                <Avatar
                                    alt={userInfo.name}
                                    src={userInfo.image}
                                    sx={{ width: 56, height: 56 }}
                                    imgProps={{ referrerPolicy: "no-referrer" }}
                                />
                            </Grid>
                            <Grid item>
                                <Typography
                                    component="h1"
                                    variant="h5"
                                    color="inherit"
                                    noWrap
                                    sx={{ flexGrow: 1 }}
                                >
                                    {userInfo.name}
                                </Typography>
                                <Typography
                                    component="h1"
                                    variant="body1"
                                    color="inherit"
                                    noWrap
                                    sx={{ flexGrow: 1 }}
                                >
                                    {userInfo.roles.join(", ")}
                                </Typography>
                            </Grid>
                        </Grid>
                    )}
                </Grid>
            }
            extraRoutes={
                userInfo.email
                    ? [
                          <ListItemButton key="logout" onClick={handleLogout}>
                              <ListItemIcon>
                                  <LogoutRoundedIcon />{" "}
                              </ListItemIcon>
                              <ListItemText primary="Logout" />
                          </ListItemButton>,
                      ]
                    : []
            }
        />
    );
};

export default Dashboard;
