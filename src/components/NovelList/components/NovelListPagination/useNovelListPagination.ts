"use client";
import { useCallback, useEffect, useRef } from "react";
import { usePaginatedBooks, useAppDispatch, useAppSelector, useErrorHandler } from "@/lib";
import { setSearchParams, selectSearchParams } from "@/lib/features/search/searchSlice";
// import { Book } from "@/types/book";

/**
 * NovelListPagination组件的自定义Hook，包含所有业务逻辑
 * @returns 包含分页书籍列表数据和处理函数的对象
 */
export const useNovelListPagination = () => {
  const dispatch = useAppDispatch();
  const { books, isLoading, totalCount, currentPage, pageSize, changePage, error } = usePaginatedBooks();
  const { showErrorModal } = useErrorHandler();
  
  // 使用 useRef 来跟踪当前请求的页码
  const pendingPageRef = useRef<number | null>(null);

  // 自动处理错误
  useEffect(() => {
    if (error) {
      showErrorModal(error, () => changePage(currentPage), {
        title: "加载书籍失败"
      });
    }
  }, [error, showErrorModal, changePage, currentPage]);

  // 监听页码变化，请求成功后滚动到顶部
  useEffect(() => {
    // 当currentPage变化且等于当前期望的页码时，表示请求成功
    if (currentPage !== null && currentPage === pendingPageRef.current) {
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // 清除pending状态
      pendingPageRef.current = null;
    }
  }, [currentPage]);

  /**
   * 处理分页变化
   * @param page 页码
   * @param newPageSize 新的页面大小
   * @param isLoading 是否正在加载
   * @param pageSize 当前页面大小
   * @param changePage 分页切换函数
   * @param dispatch Redux dispatch函数
   */
  const handlePageChange = useCallback((
    page: number, 
    newPageSize: number | undefined, 
    isLoading: boolean, 
    pageSize: number,
    changePage: (page: number) => void,
    dispatch: ReturnType<typeof useAppDispatch>
  ) => {
    if (isLoading) return;
    
    // 记录即将请求的页码
    pendingPageRef.current = page;

    // 如果pageSize变化，需要更新搜索参数
    if (newPageSize && newPageSize !== pageSize) {
      const newParams = { 
        curr: page,
        limit: newPageSize
      };
      dispatch(setSearchParams(newParams));
    } else {
      changePage(page);
    }
  }, []);

  /**
   * 重试函数
   * @param currentPage 当前页码
   * @param changePage 分页切换函数
   */
  const handleRetryLoadData = useCallback((
    currentPage: number, 
    changePage: (page: number) => void
  ) => {
    // RTK Query 会自动重试，这里可以触发重新获取
    changePage(currentPage);
  }, []);

  return {
    books,
    isLoading,
    totalCount,
    currentPage,
    pageSize,
    changePage,
    error,
    handlePageChange,
    handleRetryLoadData,
    dispatch,
    pendingPageRef
  };
};
