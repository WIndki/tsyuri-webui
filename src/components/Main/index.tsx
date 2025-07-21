"use client";
import { Spin } from "antd";
import React, { Suspense } from "react";
import Content from "../Content";
import SearchForm from "../SearchForm";
import NovelList from "../NovelList";
import Toolbar from "../Toolbar";
import RouteInitializer from "../RouteInitializer";
import { selectIsInitialized, useAppSelector } from "@/lib";

// 创建内部组件来使用 useSearchParams
const MainContent = () => {
    const initial = useAppSelector(selectIsInitialized);
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("MainContent render");
    }

    return (
        <>
            {/* 路由初始化组件，必须在 Suspense 内 */}
            <RouteInitializer />
            {initial && (
                <Content>
                    <NovelList />
                </Content>
            )}

        </>
    );
};

// 主组件，用Suspense包裹内部组件
const Main = () => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("Main render");
    }

    return (
        <>
            <Suspense
                fallback={
                    <div style={{ margin: "0 auto" }}>
                        <Spin size="large" />
                    </div>
                }
            >
                <MainContent />
            </Suspense>
            <SearchForm />
            <Toolbar />
        </>
    );
};

Main.displayName = "Main"; // 设置组件名称，便于调试

export default React.memo(Main);
