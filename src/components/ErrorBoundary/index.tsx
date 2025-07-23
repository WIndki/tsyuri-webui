import React from "react";
import ErrorBoundaryUI from "./ErrorBoundaryUI";

interface ErrorBoundaryProps {
    error: string;
    onRetry: () => void;
    onClose: () => void;
    loading?: boolean;
    title?: string;
}

/**
 * ErrorBoundary 组件 - 错误边界主组件，组合了业务逻辑和UI渲染
 * @param props ErrorBoundaryProps
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * UI 渲染由 ErrorBoundaryUI 组件负责。
 */
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
    error,
    onRetry,
    onClose,
    loading = false,
    title = "加载失败"
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("ErrorBoundary render");
    }

    return (
        <ErrorBoundaryUI
            error={error}
            onRetry={onRetry}
            onClose={onClose}
            loading={loading}
            title={title}
        />
    );
};

ErrorBoundary.displayName = "ErrorBoundary";

export default React.memo(ErrorBoundary);
