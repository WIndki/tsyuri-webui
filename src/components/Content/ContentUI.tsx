import React from "react";
import { Layout } from "antd";

interface ContentUIProps {
    children: React.ReactNode;
    processContent: (children: React.ReactNode) => React.ReactNode;
}

/**
 * ContentUI 组件 - 专门负责内容区域的UI渲染
 * @param props ContentUIProps
 * @returns JSX.Element
 */
const ContentUI: React.FC<ContentUIProps> = ({ 
    children,
    processContent
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("ContentUI render");
    }
    
    // 处理内容渲染
    const processedChildren = processContent(children);

    return (
        <Layout.Content
            style={{
                // maxWidth: "50rem",
                width: "100%",
                margin: "0 auto",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {processedChildren}
        </Layout.Content>
    );
};

ContentUI.displayName = "ContentUI";

export default React.memo(ContentUI);
