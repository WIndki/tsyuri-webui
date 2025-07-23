import React from "react";
import { App } from "antd";
import ToolbarUI from "./ToolbarUI";
import { useToolbar } from "./useToolbar";
import About from "./About/index";

/**
 * Toolbar 组件 - 工具栏主组件，组合了业务逻辑和UI渲染
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useToolbar hook 中，UI 渲染由 ToolbarUI 组件负责。
 */
const Toolbar: React.FC = () => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("Toolbar render");
    }

    const { modal } = App.useApp();
    
    // 使用自定义hook获取业务逻辑
    const { 
        mode,
        displayMode,
        handleToggleTheme,
        handleToggleDisplayMode
    } = useToolbar();

    // 处理打开关于对话框
    const handleOpenAboutModal = () => {
        modal.info({
            title: "关于",
            centered: true,
            maskClosable: true,
            closable: true,
            icon: null,
            content: <About />,
            okText: "关闭",
        });
    };

    return (
        <ToolbarUI
            displayMode={displayMode}
            mode={mode}
            handleToggleTheme={handleToggleTheme}
            handleToggleDisplayMode={handleToggleDisplayMode}
            handleOpenAbout={handleOpenAboutModal}
        />
    );
};

Toolbar.displayName = "Toolbar";

export default React.memo(Toolbar);
