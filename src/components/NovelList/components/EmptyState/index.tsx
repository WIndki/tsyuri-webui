;
import React from "react";
import { useEmptyState } from "./useEmptyState";
import EmptyStateUI from "./EmptyStateUI";

interface EmptyStateProps {
    description?: string;
    showRetry?: boolean;
    onRetry?: () => void;
    loading?: boolean;
}

/**
 * EmptyState 组件 - 空状态主组件，组合了业务逻辑和UI渲染
 * @param props EmptyStateProps
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useEmptyState hook 中，UI 渲染由 EmptyStateUI 组件负责。
 */
const EmptyState: React.FC<EmptyStateProps> = ({
    description = "暂无数据",
    showRetry = false,
    onRetry,
    loading = false
}) => {
    console.log("EmptyState render");
    
    // 使用自定义hook获取业务逻辑
    const { handleRetry } = useEmptyState();

    return (
        <EmptyStateUI
            description={description}
            showRetry={showRetry}
            onRetry={onRetry ? () => handleRetry(onRetry) : undefined}
            loading={loading}
        />
    );
};

EmptyState.displayName = "EmptyState";

export default React.memo(EmptyState);
