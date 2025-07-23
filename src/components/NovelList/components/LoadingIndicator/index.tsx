;
import React from "react";
import { useLoadingIndicator } from "./useLoadingIndicator";
import LoadingIndicatorUI from "./LoadingIndicatorUI";

interface LoadingIndicatorProps {
    type?: "inline" | "overlay" | "center";
    size?: "small" | "default" | "large";
    tip?: string;
    visible?: boolean;
}

/**
 * LoadingIndicator 组件 - 加载指示器主组件，组合了业务逻辑和UI渲染
 * @param props LoadingIndicatorProps
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useLoadingIndicator hook 中，UI 渲染由 LoadingIndicatorUI 组件负责。
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
    type = "center",
    size = "default",
    tip,
    visible = true
}) => {
    // 使用自定义hook获取业务逻辑
    const { getContainerStyle } = useLoadingIndicator();

    return (
        <LoadingIndicatorUI
            type={type}
            size={size}
            tip={tip}
            visible={visible}
            getContainerStyle={getContainerStyle}
        />
    );
};

LoadingIndicator.displayName = "LoadingIndicator";

export default React.memo(LoadingIndicator);
