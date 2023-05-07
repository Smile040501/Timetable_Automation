export type AppRoutes = {
    path?: string;
    element: JSX.Element;
    children?: AppRoutes;
    name: string;
    icon: JSX.Element;
    hidden: boolean;
}[];
