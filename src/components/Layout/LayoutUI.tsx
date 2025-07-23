import React from "react";
import ThemeConfigProvider from "@/theme/antdConfigProvider";
import { Layout as AntdLayout } from "antd";

interface LayoutUIProps {
    children: React.ReactNode;
    processLayout: (children: React.ReactNode) => React.ReactNode;
}

/**
 * LayoutUI 组件 - 专门负责布局的UI渲染
 * @param props LayoutUIProps
 * @returns JSX.Element
 */
const LayoutUI: React.FC<LayoutUIProps> = ({ 
    children,
    processLayout
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("LayoutUI render");
    }
    
    // 处理布局渲染
    const processedChildren = processLayout(children);

    return (
        <ThemeConfigProvider>
            <AntdLayout style={{ minHeight: "100vh", width: "100%" }}>
                {processedChildren}
            </AntdLayout>
        </ThemeConfigProvider>
    );
};

LayoutUI.displayName = "LayoutUI";

export default React.memo(LayoutUI);
