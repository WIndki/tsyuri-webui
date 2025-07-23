"use client";

import React from "react";
import { useMain } from "./useMain";
import MainUI from "./MainUI";

/**
 * Main 组件 - 主页面组件，组合了业务逻辑和UI渲染
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useMain hook 中，UI 渲染由 MainUI 组件负责。
 */
const Main: React.FC = () => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("Main render");
    }

    // 使用自定义hook获取业务逻辑
    const { 
        initial,
        processMainContent,
        isLoading
    } = useMain();

    return (
        <MainUI
            initial={initial}
            processMainContent={processMainContent}
            isLoading={isLoading}
        />
    );
};

Main.displayName = "Main";

export default React.memo(Main);
