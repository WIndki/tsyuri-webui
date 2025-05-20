"use client";
import React from "react";
import dynamic from "next/dynamic";
import ThemeConfigProvider from "@/theme/antdConfigProvider";
import { Layout as AntdLayout } from "antd";

// 动态导入工具栏以避免服务器端渲染问题
const DynamicToolbar = dynamic(() => import("@/components/Toolbar"), {
    ssr: false,
});

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ThemeConfigProvider>
            <AntdLayout style={{ minHeight: "100vh", width: "100%" }}>
                {children}
                <DynamicToolbar />
            </AntdLayout>
        </ThemeConfigProvider>
    );
};

export default Layout;
