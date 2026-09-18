"use client";

import { useEffect, useState, type ReactNode } from "react";

import { App as AntdApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

import { createThemeConfig } from "./theme";
import {
    PREFERENCE_CHANGE_EVENT,
    readAppliedTheme,
    type ThemeMode,
} from "@/lib/theme/preferences";

/**
 * Tracks the currently applied theme.
 *
 * The initial value is read from the DOM rather than from `localStorage`: the bootstrap
 * script already committed the resolved theme to `data-theme` before first paint, so
 * reading that attribute back means the first client render agrees with the server markup
 * exactly. There is no hydration mismatch and no second paint.
 *
 * A DOM event is used instead of React context so that a theme change re-renders only this
 * provider (and antd beneath it), not every consumer in the tree.
 */
function useAppliedTheme(): ThemeMode {
    const [theme, setTheme] = useState<ThemeMode>(readAppliedTheme);

    useEffect(() => {
        const sync = () => setTheme(readAppliedTheme());
        window.addEventListener(PREFERENCE_CHANGE_EVENT, sync);
        return () => window.removeEventListener(PREFERENCE_CHANGE_EVENT, sync);
    }, []);

    return theme;
}

/**
 * Client-side providers.
 *
 * This is the only Client Component above the page tree. Everything below it stays a Server
 * Component unless it genuinely needs browser APIs, which keeps the hydrated bundle limited
 * to the interactive islands.
 */
export function Providers({ children }: { children: ReactNode }) {
    const theme = useAppliedTheme();

    return (
        <ConfigProvider locale={zhCN} theme={createThemeConfig(theme)}>
            {/*
             * `App` supplies the context that `message`, `notification` and `modal` need in
             * antd v6. Without it they fall back to a static method that renders outside the
             * configured theme and locale.
             */}
            <AntdApp>{children}</AntdApp>
        </ConfigProvider>
    );
}
