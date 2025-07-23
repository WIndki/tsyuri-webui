import { useCallback } from "react";

/**
 * LoadingIndicator组件的自定义Hook，包含所有业务逻辑
 * @returns 包含加载指示器处理逻辑的对象
 */
export const useLoadingIndicator = () => {
  /**
   * 获取容器样式
   * @param type 加载指示器类型
   * @returns 容器样式对象
   */
  const getContainerStyle = useCallback((type: "inline" | "overlay" | "center") => {
    switch (type) {
      case "inline":
        return {
          textAlign: "center" as const,
          padding: "16px"
        };
      case "center":
      default:
        return {
          textAlign: "center" as const,
          marginTop: "16px",
          marginBottom: "16px",
          height: "160px",
          display: "flex",
          justifyContent: "center"
        };
    }
  }, []);

  return {
    getContainerStyle
  };
};
