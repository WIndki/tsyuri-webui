import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearError, searchBooks, searchBooksWithPagination } from "@/redux/slices/booksSlice";
import { RootState } from "@/redux/store";
import { useErrorModal } from "../components/ErrorBoundary";

/**
 * 统一的错误处理Hook
 * @returns 错误处理相关的方法和状态
 */
export const useErrorHandler = () => {
    const dispatch = useAppDispatch();
    const { error, loading, searchParams } = useAppSelector((state: RootState) => state.books);
    const { displayMode } = useAppSelector((state: RootState) => state.theme);
    const { showError } = useErrorModal();

    // 清除错误
    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    // 重试请求
    const handleRetry = useCallback(() => {
        dispatch(clearError());
        
        // 根据显示模式选择相应的搜索action
        if (displayMode === "pagination") {
            dispatch(searchBooksWithPagination(searchParams));
        } else {
            dispatch(searchBooks(searchParams));
        }
    }, [dispatch, displayMode, searchParams]);

    // 监听错误状态，自动显示错误模态框
    useEffect(() => {
        if (error) {
            showError(error, handleRetry, {
                title: "加载失败",
                loading: loading
            });
            // 显示模态框后清除Redux中的错误状态，避免重复显示
            dispatch(clearError());
        }
    }, [error, showError, handleRetry, loading, dispatch]);

    return {
        error,
        loading,
        hasError: !!error,
        clearError: handleClearError,
        retry: handleRetry,
        showError
    };
};

export default useErrorHandler;
