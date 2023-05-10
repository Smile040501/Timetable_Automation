/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./app/App";
import "./styles.css";
import { environment as env } from "./environment";
import { store } from "./app/redux/store";

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={env.googleClientId!}>
            <Provider store={store}>
                <App />
            </Provider>
        </GoogleOAuthProvider>
    </React.StrictMode>
);
