"use client";
import React, { useEffect } from "react";
import { ConfigProvider, theme, App } from "antd";
import { useAppSelector } from "@/redux/hooks";

const ThemeConfigProvider = ({ children }: { children: React.ReactNode }) => {
    const { mode } = useAppSelector((state) => state.theme);

    // 根据主题模式选择算法
    const algorithm =
        mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm;

    // 在客户端使用 useEffect 来设置 html 的 data-theme 属性
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", mode);
        // 兼容旧的方式，同时设置 body
        document.body.setAttribute("data-theme", mode);
    }, [mode]);

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
                    ...themeColors[mode],
                    borderRadius: 4,
                    wireframe: false, // 使用填充设计
                },
                components: {
                    FloatButton: {
                        boxShadowSecondary: "0 6px 16px rgba(0, 0, 0, 0.15)",
                    },
                },
            }}
        >
            <App>{children}</App>
        </ConfigProvider>
    );
};

export default ThemeConfigProvider;
