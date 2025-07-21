"use client";

import React, { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/lib";
import { initializeFromUrl, startPopstateListener } from "@/lib/features/router/routerSlice";

/**
 * 路由初始化组件
 * 负责在客户端初始化路由状态并启动浏览器事件监听
 */
export const RouteInitializer: React.FC = () => {

    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {

        // 初始化路由状态
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });
        if (process.env.NEXT_PUBLIC_DEBUG === "true") {
            console.log("🔗 RouteInitializer: 初始化路由状态", { pathname, params });
        }
        dispatch(initializeFromUrl({
            pathname,
            params
        }));

        // 启动 popstate 监听器
        dispatch(startPopstateListener());

    }, []);

    // 这个组件不渲染任何 UI
    return null;
};

export default RouteInitializer;
