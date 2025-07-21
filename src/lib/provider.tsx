"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { setTheme } from "./features/theme/themeSlice";

export function StoreProvider({ children }: { children: React.ReactNode }) {
    // 在客户端水合时，初始化应用状态
    useEffect(() => {
        // 从 localStorage 加载主题设置
        if (process.env.NEXT_PUBLIC_DEBUG === "true") {
            console.log("🔗 Provider: 初始化主题");
        }
        const savedTheme = localStorage.getItem("themeMode");
        if (savedTheme === "dark" || savedTheme === "light") {
            store.dispatch(setTheme(savedTheme));
        }
    }, []);

    return <Provider store={store}>{children}</Provider>;
}
