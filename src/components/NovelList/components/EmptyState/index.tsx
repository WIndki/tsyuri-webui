"use client";
import React from "react";
import { Empty, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

interface EmptyStateProps {
    description?: string;
    showRetry?: boolean;
    onRetry?: () => void;
    loading?: boolean;
}

/**
 * 统一的空状态组件
 * @param props EmptyStateProps
 * @returns JSX.Element
 */
const EmptyState: React.FC<EmptyStateProps> = ({
    description = "暂无数据",
    showRetry = false,
    onRetry,
    loading = false
}) => {
    return (
        <Empty 
            description={description}
            style={{ padding: "2rem" }}
        >
            {showRetry && onRetry && (
                <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={onRetry}
                    loading={loading}
                >
                    重新加载
                </Button>
            )}
        </Empty>
    );
};

EmptyState.displayName = "EmptyState";

export default EmptyState;
