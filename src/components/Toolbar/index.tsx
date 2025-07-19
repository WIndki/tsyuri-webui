import React from "react";
import { App, FloatButton } from "antd";
import {
    ArrowUpOutlined,
    BulbOutlined,
    BulbFilled,
    QuestionOutlined,
    UnorderedListOutlined,
    AppstoreOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toggleTheme, toggleDisplayMode } from "@/redux/slices/themeSlice";
import About from "./About";

const Toolbar: React.FC = () => {
    const dispatch = useAppDispatch();
    const { mode, displayMode } = useAppSelector((state) => state.theme);
    const { modal } = App.useApp();

    // 切换主题
    const handleToggleTheme = () => {
        dispatch(toggleTheme());
    };

    // 切换显示模式
    const handleToggleDisplayMode = () => {
        dispatch(toggleDisplayMode());
    };

    const handleOpenAbout = () => {
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

export default Toolbar;
