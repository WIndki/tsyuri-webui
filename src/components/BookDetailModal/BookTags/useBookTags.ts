import { useCallback } from "react";
import { Modal } from "antd";
import Debounce from "@/utils/Debounce";
import { useAppDispatch, useAppSelector, setSearchParams, selectSearchParams } from "@/lib";

/**
 * BookTags组件的自定义Hook，包含所有业务逻辑
 * @returns 包含书籍标签处理逻辑的对象
 */
export const useBookTags = () => {
  const dispatch = useAppDispatch();
  const searchParams = useAppSelector(selectSearchParams);
  
  /**
   * 格式化标签显示
   * @param tagString 标签字符串
   * @returns 标签数组
   */
  const renderTags = useCallback((tagString: string) => {
    if (!tagString) return [];
    return tagString.split(",").filter((tag) => tag.trim());
  }, []);

  /**
   * 处理标签点击事件
   * @param event 鼠标点击事件
   * @param dispatch Redux dispatch函数
   * @param searchParams 当前搜索参数
   */
  const handleTagClick = useCallback((
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    dispatch: ReturnType<typeof useAppDispatch>,
    searchParams: ReturnType<typeof selectSearchParams>
  ) => {
    event.stopPropagation();
    const targetElement = event.target as HTMLElement;
    const clickedTagElement = targetElement.closest(".novel-tag");
    if (clickedTagElement instanceof HTMLElement) {
      const tagName = (clickedTagElement.textContent || "").trim();
      if (tagName) {
        // 使用新的搜索参数管理方式
        const newParams = {
          ...searchParams,
          tag: tagName, // 设置新的标签过滤条件
          curr: 1, // 重置当前页码
          limit: 20, // 每页显示20本书
        };
        dispatch(setSearchParams(newParams)); // 设置新的搜索参数
        Modal.destroyAll(); // 关闭所有模态框
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * 防抖处理的标签点击函数
   */
  const debounceHandleTagClick = useCallback(
    Debounce(
      (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        handleTagClick(event, dispatch, searchParams);
      },
      1000,
      true
    ),
    [handleTagClick, dispatch, searchParams]
  );

  return {
    renderTags,
    debounceHandleTagClick
  };
};
