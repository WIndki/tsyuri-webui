import React from "react";
import { useRouteInitializer } from "./useRouteInitializer";
import RouteInitializerUI from "./RouteInitializerUI";

/**
 * RouteInitializer 组件 - 路由初始化主组件，组合了业务逻辑和UI渲染
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useRouteInitializer hook 中，UI 渲染由 RouteInitializerUI 组件负责。
 */
export const RouteInitializer: React.FC = () => {
    // 使用自定义hook获取业务逻辑
    const { processRouteInitialization } = useRouteInitializer();

    return (
        <RouteInitializerUI
            processRouteInitialization={processRouteInitialization}
        />
    );
};

RouteInitializer.displayName = "RouteInitializer";

export default RouteInitializer;
