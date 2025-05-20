"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { setTheme } from "./slices/themeSlice";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
    // 在客户端水合时，从 localStorage 加载主题设置
    useEffect(() => {
        const savedTheme = localStorage.getItem("themeMode");
        if (savedTheme === "dark" || savedTheme === "light") {
            store.dispatch(setTheme(savedTheme));
        }
    }, []);

    return <Provider store={store}>{children}</Provider>;
}
