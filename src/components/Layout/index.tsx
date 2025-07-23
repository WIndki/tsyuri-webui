import React from "react";
import { useLayout } from "./useLayout";
import LayoutUI from "./LayoutUI";

interface LayoutProps {
    children: React.ReactNode;
}

/**
 * Layout 组件 - 布局主组件，组合了业务逻辑和UI渲染
 * @param props LayoutProps
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useLayout hook 中，UI 渲染由 LayoutUI 组件负责。
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("Layout render");
    }

    // 使用自定义hook获取业务逻辑
    const { processLayout } = useLayout();

    return (
        <LayoutUI
            processLayout={processLayout}
        >
            {children}
        </LayoutUI>
    );
};

Layout.displayName = "Layout";

export default React.memo(Layout);
