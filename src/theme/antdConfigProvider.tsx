"use client";
import React, { useEffect, useState } from "react";
import { ConfigProvider, theme, App } from "antd";
import { useAppSelector, selectThemeMode } from "@/lib";

const ThemeConfigProvider = ({ children }: { children: React.ReactNode }) => {
    const storeMode = useAppSelector(selectThemeMode);
    const [currentMode, setCurrentMode] = useState<"light" | "dark">("light");
    const [isHydrated, setIsHydrated] = useState(false);

    // 在客户端水合后设置正确的主题
    useEffect(() => {
        setIsHydrated(true);
        setCurrentMode(storeMode);
    }, [storeMode]);

    // 在客户端使用 useEffect 来设置 html 的 data-theme 属性
    useEffect(() => {
        if (isHydrated && typeof window !== "undefined") {
            document.documentElement.setAttribute("data-theme", currentMode);
            document.body.setAttribute("data-theme", currentMode);
        }
    }, [currentMode, isHydrated]);

    // 根据主题模式选择算法 - 在水合之前使用默认主题
    const algorithm =
        currentMode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm;

    // 定义主题颜色
    const themeColors = {
        light: {
            colorPrimary: "#1677ff", // 蓝色主题色
            colorSuccess: "#52c41a",
            colorWarning: "#faad14",
            colorError: "#f5222d",
            colorInfo: "#1677ff",
        },
        dark: {
            colorPrimary: "#177ddc", // 深色模式下的蓝色
            colorSuccess: "#49aa19",
            colorWarning: "#d89614",
            colorError: "#d32029",
            colorInfo: "#177ddc",
        },
    };

    return (
        <ConfigProvider
            theme={{
                algorithm,
                token: {
                    ...themeColors[currentMode],
                    borderRadius: 4,
                    wireframe: false, // 使用填充设计
                },
                components: {
                    FloatButton: {
                        boxShadowSecondary: "0 6px 16px rgba(0, 0, 0, 0.15)",
                    },
                },
                cssVar: true,
            }}
        >
            <App>{children}</App>
        </ConfigProvider>
    );
};

export default ThemeConfigProvider;
