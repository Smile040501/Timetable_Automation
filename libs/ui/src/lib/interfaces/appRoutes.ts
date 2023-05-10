import { UserRole } from "@ta/shared/utils";

export type AppRoute = {
    path?: string;
    element: JSX.Element;
    children?: AppRoute[];
    name: string;
    icon: JSX.Element;
    hidden: boolean;
    private: boolean;
    allowedUsers: UserRole[];
};

export type AppRoutes = AppRoute[];
