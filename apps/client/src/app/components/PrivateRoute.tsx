/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useMemo } from "react";
import { Navigate } from "react-router-dom";
import intersection from "lodash/intersection";

import { UserRole } from "@ta/shared/utils";

import { makeUserInfoSelector } from "../redux/selectors";
import { useAppSelector } from "../redux/hooks";

const PrivateRoute: React.FC<{
    children: JSX.Element;
    allowedUsers: UserRole[];
}> = ({ children, allowedUsers }) => {
    const userInfoSelector = useMemo(makeUserInfoSelector, []);
    const userInfo = useAppSelector(userInfoSelector);

    if (!userInfo.email) {
        return <Navigate replace to="/login" />;
    }

    if (intersection(userInfo.roles, allowedUsers).length === 0) {
        if (
            userInfo.roles.indexOf(UserRole.Admin) !== -1 ||
            userInfo.roles.indexOf(UserRole.Coordinator) !== -1
        ) {
            return <Navigate replace to="/" />;
        } else {
            return <Navigate replace to="/timetable" />;
        }
    }

    return children;
};

export default PrivateRoute;
