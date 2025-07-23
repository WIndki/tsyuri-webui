"use client";
import React, { useEffect } from "react";

interface RouteInitializerUIProps {
    processRouteInitialization: () => void;
}

/**
 * RouteInitializerUI 组件 - 专门负责路由初始化的UI渲染
 * @param props RouteInitializerUIProps
 * @returns JSX.Element
 */
const RouteInitializerUI: React.FC<RouteInitializerUIProps> = ({ 
    processRouteInitialization
}) => {
    useEffect(() => {
        // 处理路由初始化
        processRouteInitialization();
    }, [processRouteInitialization]);

    // 这个组件不渲染任何 UI
    return null;
};

RouteInitializerUI.displayName = "RouteInitializerUI";

export default RouteInitializerUI;
