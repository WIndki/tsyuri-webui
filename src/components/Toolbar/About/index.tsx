;
import React from "react";
import { useAbout } from "./useAbout";
import AboutUI from "./AboutUI";

/**
 * About 组件 - 关于信息主组件，组合了业务逻辑和UI渲染
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useAbout hook 中，UI 渲染由 AboutUI 组件负责。
 */
const About: React.FC = () => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("About render");
    }

    // 使用自定义hook获取业务逻辑
    const { } = useAbout();

    return (
        <AboutUI />
    );
};

export default React.memo(About);
