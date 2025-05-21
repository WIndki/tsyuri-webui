"use client";

import React from "react";
import { FloatButton } from "antd";
import { ArrowUpOutlined, BulbOutlined, BulbFilled } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toggleTheme } from "@/redux/slices/themeSlice";

const Toolbar: React.FC = () => {
    const dispatch = useAppDispatch();
    const { mode } = useAppSelector((state) => state.theme);

    // 切换主题
    const handleToggleTheme = () => {
        dispatch(toggleTheme());
    };

    return (
        <FloatButton.Group
            trigger="hover"
            style={{ right: 12, bottom: 155 }}
            icon={<ArrowUpOutlined />}
        >
            <FloatButton.BackTop
                icon={<ArrowUpOutlined />}
                tooltip="返回顶部"
                style={{
                    transition: "opacity 0.3s ease-in-out",
                }}
            />{" "}
            <FloatButton
                icon={mode === "dark" ? <BulbFilled /> : <BulbOutlined />}
                tooltip={mode === "dark" ? "切换到亮色模式" : "切换到暗色模式"}
                onClick={handleToggleTheme}
            />
        </FloatButton.Group>
    );
};

export default Toolbar;
