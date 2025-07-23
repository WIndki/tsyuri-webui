import { useCallback } from "react";
import { 
    useAppDispatch, 
    useAppSelector, 
    toggleTheme, 
    toggleDisplayMode,
    selectThemeMode,
    selectDisplayMode
} from "@/lib";

/**
 * Toolbar组件的自定义Hook，包含所有业务逻辑
 * @returns 包含工具栏处理逻辑的对象
 */
export const useToolbar = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);
  const displayMode = useAppSelector(selectDisplayMode);

  /**
   * 切换主题
   */
  const handleToggleTheme = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  /**
   * 切换显示模式
   */
  const handleToggleDisplayMode = useCallback(() => {
    dispatch(toggleDisplayMode());
  }, [dispatch]);


  return {
    mode,
    displayMode,
    handleToggleTheme,
    handleToggleDisplayMode
  };
};
