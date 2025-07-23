import { useCallback } from "react";
import { useAppSelector } from "@/lib/hooks";
import { selectDisplayMode } from "@/lib/features/theme/themeSlice";

/**
 * NovelList组件的自定义Hook，包含所有业务逻辑
 * @returns 包含显示模式选择逻辑的对象
 */
export const useNovelList = () => {
  /**
   * 获取当前的显示模式
   */
  const displayMode = useAppSelector(selectDisplayMode);

  /**
   * 根据显示模式选择合适的列表组件
   * @param paginationComponent 分页组件
   * @param infiniteComponent 无限滚动组件
   * @returns 适合当前显示模式的组件
   */
  const selectListComponent = useCallback(
    (paginationComponent: React.ComponentType<unknown>, infiniteComponent: React.ComponentType<unknown>) => {
      return displayMode === "pagination" ? paginationComponent : infiniteComponent;
    },
    [displayMode]
  );

  return {
    displayMode,
    selectListComponent
  };
};
