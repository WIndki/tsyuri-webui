import { useCallback } from "react";

/**
 * NovelCover组件的自定义Hook，包含所有业务逻辑
 * @returns 包含封面处理逻辑的对象
 */
export const useNovelCover = () => {
  /**
   * 处理图片加载错误
   * @param event 图片加载错误事件
   */
  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = event.currentTarget;
    target.onerror = null;
    target.src = "/images/book-placeholder.jpg";
  }, []);

  /**
   * 处理卡片点击
   * @param onClick 点击回调函数
   */
  const handleCardClick = useCallback((onClick?: () => void) => {
    if (onClick) {
      onClick();
    }
  }, []);

  return {
    handleImageError,
    handleCardClick
  };
};
