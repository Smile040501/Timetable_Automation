import React from "react";
import { Navigate } from "react-router-dom";
import intersection from "lodash/intersection";

import { UserRole } from "@ta/shared/utils";
import { AuthUserState } from "@ta/shared/models";

const PrivateRoute: React.FC<{
    children: JSX.Element;
    allowedUsers: UserRole[];
}> = ({ children, allowedUsers }) => {
    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) {
        return <Navigate replace to="/login" />;
    }

    const user = JSON.parse(userInfo) as AuthUserState;
    if (!user.email) {
        return <Navigate replace to="/login" />;
    }

    if (intersection(user.roles, allowedUsers).length === 0) {
        if (
            user.roles.indexOf(UserRole.Admin) !== -1 ||
            user.roles.indexOf(UserRole.Coordinator) !== -1
        ) {
            return <Navigate replace to="/" />;
        } else {
            return <Navigate replace to="/timetable" />;
        }
    }

    return children;
};

export default PrivateRoute;
