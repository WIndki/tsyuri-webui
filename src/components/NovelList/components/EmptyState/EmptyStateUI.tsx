;
import React from "react";
import { Empty, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

interface EmptyStateUIProps {
    description?: string;
    showRetry?: boolean;
    onRetry?: () => void;
    loading?: boolean;
}

/**
 * EmptyStateUI 组件 - 专门负责空状态的UI渲染
 * @param props EmptyStateUIProps
 * @returns JSX.Element
 */
const EmptyStateUI: React.FC<EmptyStateUIProps> = ({
    description = "暂无数据",
    showRetry = false,
    onRetry,
    loading = false
}) => {
    console.log("EmptyStateUI render");
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

export default React.memo(EmptyStateUI);
