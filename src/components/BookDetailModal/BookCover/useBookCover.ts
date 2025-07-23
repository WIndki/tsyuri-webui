import { useCallback } from "react";

/**
 * BookCover组件的自定义Hook，包含所有业务逻辑
 * @returns 包含书籍封面处理逻辑的对象
 */
export const useBookCover = () => {
  /**
   * 处理图片加载错误
   * @param event 图片加载错误事件
   */
  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.currentTarget;
    target.onerror = null;
    target.src = "/images/book-placeholder.jpg";
  }, []);

  return {
    handleImageError
  };
};
