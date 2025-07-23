import React from "react";
import { FloatButton } from "antd";
import {
    ArrowUpOutlined,
    BulbOutlined,
    BulbFilled,
    QuestionOutlined,
    UnorderedListOutlined,
    AppstoreOutlined,
} from "@ant-design/icons";

interface ToolbarUIProps {
    displayMode: string;
    mode: string;
    handleToggleTheme: () => void;
    handleToggleDisplayMode: () => void;
    handleOpenAbout: () => void;
}

/**
 * ToolbarUI 组件 - 专门负责工具栏的UI渲染
 * @param props ToolbarUIProps
 * @returns JSX.Element
 */
const ToolbarUI: React.FC<ToolbarUIProps> = ({ 
    displayMode,
    mode,
    handleToggleTheme,
    handleToggleDisplayMode,
    handleOpenAbout
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("ToolbarUI render");
    };

    return (
        <FloatButton.Group
            trigger="click"
            shape="circle"
            style={{ right: 12, bottom: 155, zIndex: 99 }}
            icon={<ArrowUpOutlined />}
        >
            <FloatButton.BackTop
                icon={<ArrowUpOutlined />}
                tooltip="返回顶部"
                style={{
                    transition: "opacity 0.3s ease-in-out",
                }}
            />
            <FloatButton
                icon={displayMode === "pagination" ? <UnorderedListOutlined /> : <AppstoreOutlined />}
                tooltip={displayMode === "pagination" ? "切换到无限滚动模式" : "切换到分页模式"}
                onClick={handleToggleDisplayMode}
            />
            <FloatButton
                icon={mode === "dark" ? <BulbFilled /> : <BulbOutlined />}
                tooltip={mode === "dark" ? "切换到亮色模式" : "切换到暗色模式"}
                onClick={handleToggleTheme}
            />
            <FloatButton
                icon={<QuestionOutlined />}
                tooltip="关于"
                onClick={handleOpenAbout}
            />
        </FloatButton.Group>
    );
};

ToolbarUI.displayName = "ToolbarUI";

export default ToolbarUI;
