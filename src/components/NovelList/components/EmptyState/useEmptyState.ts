import { useCallback } from "react";

/**
 * EmptyState组件的自定义Hook，包含所有业务逻辑
 * @returns 包含空状态处理逻辑的对象
 */
export const useEmptyState = () => {
  /**
   * 处理重试操作
   * @param onRetry 重试回调函数
   */
  const handleRetry = useCallback((onRetry?: () => void) => {
    if (onRetry) {
      onRetry();
    }
  }, []);

  return {
    handleRetry
  };
};
