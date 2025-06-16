import React from "react";
import dynamic from "next/dynamic";
import ThemeConfigProvider from "@/theme/antdConfigProvider";
import { Layout as AntdLayout } from "antd";

// 动态导入工具栏以避免服务器端渲染问题
const DynamicToolbar = dynamic(() => import("@/components/Toolbar"), {
    ssr: true, // 确保在服务器端渲染时也加载
});

const DynamicSearchForm = dynamic(() => import("@/components/SearchForm"), {
    ssr: true, // 确保在服务器端渲染时也加载
});

const Layout = ({ children }: { children: React.ReactNode }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("Layout render");
    }
    return (
        <ThemeConfigProvider>
            <AntdLayout style={{ minHeight: "100vh", width: "100%" }}>
                {children}
                <DynamicSearchForm />
                <DynamicToolbar />
            </AntdLayout>
        </ThemeConfigProvider>
    );
};

export default Layout;
