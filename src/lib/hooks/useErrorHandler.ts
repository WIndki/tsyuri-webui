import React, { useCallback } from "react";
import { App } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { SerializedError } from "@reduxjs/toolkit";
import { getUserFriendlyErrorMessage } from "@/lib/api/bookApi";

/**
 * 错误处理 Hook
 * 提供统一的错误显示和重试功能
 */
export function useErrorHandler() {
    const { modal, message } = App.useApp();

    /**
     * 显示错误模态框
     */
    const showErrorModal = useCallback((
        error: FetchBaseQueryError | SerializedError | string,
        onRetry?: () => void,
        options?: {
            title?: string;
            loading?: boolean;
        }
    ) => {
        let errorMessage: string;
        
        if (typeof error === 'string') {
            errorMessage = error;
        } else if ('status' in error) {
            // FetchBaseQueryError
            errorMessage = getUserFriendlyErrorMessage(error);
        } else if ('message' in error) {
            // SerializedError
            errorMessage = error.message || "发生未知错误";
        } else {
            errorMessage = "发生未知错误";
        }

        const modalInstance = modal.error({
            title: options?.title || "请求失败",
            content: React.createElement('p', { 
                style: { margin: 0, color: '#666' } 
            }, errorMessage),
            centered: true,
            maskClosable: false,
            closable: true,
            width: 480,
            okText: onRetry ? "重试" : "确定",
            okButtonProps: onRetry ? {
                icon: React.createElement(ReloadOutlined),
                loading: options?.loading
            } : undefined,
            cancelText: onRetry ? "关闭" : undefined,
            onOk: onRetry ? () => {
                onRetry();
                modalInstance.destroy();
            } : undefined
        });

        return modalInstance;
    }, [modal]);

    /**
     * 显示错误消息（轻量级）
     */
    const showErrorMessage = useCallback((
        error: FetchBaseQueryError | SerializedError | string,
        duration?: number
    ) => {
        let errorMessage: string;
        
        if (typeof error === 'string') {
            errorMessage = error;
        } else if ('status' in error) {
            // FetchBaseQueryError
            errorMessage = getUserFriendlyErrorMessage(error);
        } else if ('message' in error) {
            // SerializedError
            errorMessage = error.message || "发生未知错误";
        } else {
            errorMessage = "发生未知错误";
        }

        message.error(errorMessage, duration);
    }, [message]);

    /**
     * 处理 RTK Query 错误的便捷方法
     */
    const handleQueryError = useCallback((
        error: FetchBaseQueryError | SerializedError | undefined,
        onRetry?: () => void,
        options?: {
            useModal?: boolean;
            title?: string;
            loading?: boolean;
            duration?: number;
        }
    ) => {
        if (!error) return;

        if (options?.useModal !== false) {
            // 默认使用模态框
            showErrorModal(error, onRetry, {
                title: options?.title,
                loading: options?.loading
            });
        } else {
            // 使用消息提示
            showErrorMessage(error, options?.duration);
        }
    }, [showErrorModal, showErrorMessage]);

    return {
        showErrorModal,
        showErrorMessage,
        handleQueryError
    };
}

/**
 * 自动错误处理 Hook
 * 当错误发生时自动显示错误信息
 */
export function useAutoErrorHandler(
    error: FetchBaseQueryError | SerializedError | undefined,
    onRetry?: () => void,
    options?: {
        enabled?: boolean;
        useModal?: boolean;
        title?: string;
        loading?: boolean;
        duration?: number;
    }
) {
    const { handleQueryError } = useErrorHandler();

    // 自动处理错误
    if (error && options?.enabled !== false) {
        handleQueryError(error, onRetry, options);
    }

    return { handleQueryError };
}
