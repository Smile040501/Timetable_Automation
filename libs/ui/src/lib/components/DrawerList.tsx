/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useMemo } from "react";
import { NavLink, NavLinkProps } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import type { AppRoutes } from "../interfaces/appRoutes";

const ListItemLink: React.FC<{
    icon: JSX.Element;
    primary: string;
    to: string;
}> = (props) => {
    const { icon, primary, to } = props;

    const CustomLink = useMemo(
        () =>
            React.forwardRef<HTMLAnchorElement, Omit<NavLinkProps, "to">>(
                function Link(linkProps, ref) {
                    return (
                        <NavLink
                            ref={ref}
                            to={to}
                            {...linkProps}
                            className={({ isActive }) => {
                                return isActive
                                    ? linkProps.className + " Mui-selected"
                                    : (linkProps.className as string);
                            }}
                        />
                    );
                }
            ),
        [to]
    );

    return (
        <ListItemButton component={CustomLink}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={primary} />
        </ListItemButton>
    );
};

const getDrawerListItems = (routes: AppRoutes) => {
    const routesList: JSX.Element[] = [];
    routes.forEach((route) => {
        if (!route.hidden) {
            routesList.push(
                <ListItemLink
                    icon={route.icon}
                    primary={route.name}
                    to={route.path!}
                    key={uuidv4()}
                />
            );
        }

        if (route.children) {
            routesList.push(...getDrawerListItems(route.children));
        }
    });

    return routesList;
};

export const DrawerList: React.FC<{ routes: AppRoutes }> = ({ routes }) => {
    return <List component="nav">{getDrawerListItems(routes)}</List>;
};
