import React from "react";
import { Modal, Button } from "antd";
import { ReloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

interface ErrorBoundaryUIProps {
    error: string;
    onRetry: () => void;
    onClose: () => void;
    loading?: boolean;
    title?: string;
}

/**
 * ErrorBoundaryUI 组件 - 专门负责错误边界的UI渲染
 * @param props ErrorBoundaryUIProps
 * @returns JSX.Element
 */
const ErrorBoundaryUI: React.FC<ErrorBoundaryUIProps> = ({
    error,
    onRetry,
    onClose,
    loading = false,
    title = "加载失败"
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("ErrorBoundaryUI render");
    }

    const handleRetry = () => {
        onRetry();
        onClose(); // 重试后关闭模态框
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                    {title}
                </div>
            }
            open={true}
            onCancel={onClose}
            centered
            maskClosable={true}
            closable={true}
            width={480}
            footer={[
                <Button key="close" onClick={onClose}>
                    关闭
                </Button>,
                <Button
                    key="retry"
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={handleRetry}
                    loading={loading}
                >
                    重试
                </Button>
            ]}
        >
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{error}</p>
        </Modal>
    );
};

ErrorBoundaryUI.displayName = "ErrorBoundaryUI";

export default React.memo(ErrorBoundaryUI);
