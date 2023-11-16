import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { IconSettings } from "@salesforce/design-system-react"

import actionSprite from "@salesforce-ux/design-system/assets/icons/action-sprite/svg/symbols.svg";
import customSprite from "@salesforce-ux/design-system/assets/icons/custom-sprite/svg/symbols.svg";
import doctypeSprite from "@salesforce-ux/design-system/assets/icons/doctype-sprite/svg/symbols.svg";
import standardSprite from "@salesforce-ux/design-system/assets/icons/standard-sprite/svg/symbols.svg";
import utilitySprite from "@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg";
import "./index.css";
import "@salesforce-ux/design-system/scss/index.scss";

import App from "./App";
import React from "react";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

window.addEventListener("error", (err) => console.error("CAUGHT!", err));
window.addEventListener("unhandledrejection", (err) =>
    console.error("CAUGHT unhandledrejection!", err)
);
root.render(
    <IconSettings
        actionSprite={actionSprite}
        customSprite={customSprite}
        doctypeSprite={doctypeSprite}
        standardSprite={standardSprite}
        utilitySprite={utilitySprite}
    >
        <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="*" element={<App />}></Route>
            </Routes>
        </BrowserRouter>
        </React.StrictMode>       
    </IconSettings>
);
