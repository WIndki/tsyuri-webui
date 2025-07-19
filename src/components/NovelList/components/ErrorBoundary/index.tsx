"use client";
import React from "react";
import { Modal, Button, App } from "antd";
import { ReloadOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

interface ErrorModalProps {
    error: string;
    onRetry: () => void;
    onClose: () => void;
    loading?: boolean;
    title?: string;
}

/**
 * 错误模态框组件
 * @param props ErrorModalProps
 * @returns JSX.Element
 */
const ErrorModal: React.FC<ErrorModalProps> = ({
    error,
    onRetry,
    onClose,
    loading = false,
    title = "加载失败"
}) => {
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

/**
 * 用于显示错误的Hook
 */
export const useErrorModal = () => {
    const { modal } = App.useApp();

    const showError = (
        error: string,
        onRetry: () => void,
        options?: {
            title?: string;
            loading?: boolean;
        }
    ) => {
        const modalInstance = modal.error({
            title: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {options?.title || "加载失败"}
                </div>
            ),
            content: (
                <div style={{ marginTop: '16px' }}>
                    <p style={{ margin: 0, color: '#666' }}>{error}</p>
                </div>
            ),
            centered: true,
            maskClosable: true,
            closable: true,
            width: 480,
            okText: "重试",
            okButtonProps: {
                icon: <ReloadOutlined />,
                loading: options?.loading
            },
            cancelText: "关闭",
            onOk: () => {
                onRetry();
                modalInstance.destroy();
            }
        });

        return modalInstance;
    };

    return { showError };
};

ErrorModal.displayName = "ErrorModal";

export default ErrorModal;
