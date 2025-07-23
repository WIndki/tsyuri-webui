import { useCallback } from "react";

/**
 * Content组件的自定义Hook，包含所有业务逻辑
 * @returns 包含内容处理逻辑的对象
 */
export const useContent = () => {
  /**
   * 处理内容渲染
   * @param children 子元素
   * @returns 处理后的内容
   */
  const processContent = useCallback((children: React.ReactNode) => {
    // 这里可以添加任何需要的内容处理逻辑
    // 目前直接返回子元素
    return children;
  }, []);

  return {
    processContent
  };
};
