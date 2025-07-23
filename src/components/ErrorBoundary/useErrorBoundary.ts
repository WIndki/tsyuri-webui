import { useCallback } from "react";
import { App } from "antd";

/**
 * ErrorBoundary组件的自定义Hook，包含所有业务逻辑
 * @returns 包含错误处理逻辑的对象
 */
export const useErrorBoundary = () => {
  const { modal } = App.useApp();

  /**
   * 显示错误模态框
   * @param error 错误信息
   * @param onRetry 重试回调函数
   * @param options 配置选项
   */
  const showError = useCallback((
    error: string,
    onRetry: () => void,
    options?: {
      title?: string;
      loading?: boolean;
    }
  ) => {
    const modalInstance = modal.error({
      title: options?.title || "加载失败",
      content: error,
      centered: true,
      maskClosable: true,
      closable: true,
      width: 480,
      okText: "重试",
      okButtonProps: {
        loading: options?.loading
      },
      cancelText: "关闭",
      onOk: () => {
        onRetry();
      }
    });

    return modalInstance;
  }, [modal]);

  /**
   * 处理重试操作
   * @param onRetry 重试回调函数
   * @param onClose 关闭回调函数
   */
  const handleRetry = useCallback((
    onRetry: () => void,
    onClose: () => void
  ) => {
    onRetry();
    onClose(); // 重试后关闭模态框
  }, []);

  return {
    showError,
    handleRetry
  };
};
