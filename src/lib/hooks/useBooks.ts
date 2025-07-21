import { useState, useEffect, useCallback } from "react";
import { useSearchBooksQuery, useLazySearchBooksQuery, BookSearchParams, getUserFriendlyErrorMessage, checkBusinessError } from "@/lib/api/bookApi";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { selectSearchParams, setSearchParams, incrementPage, resetToFirstPage, saveSuccessfulState, rollbackToLastSuccessfulState } from "@/lib/features/search/searchSlice";
import { selectDisplayMode } from "@/lib/features/theme/themeSlice";
import { Book } from "@/types/book";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { SerializedError } from "@reduxjs/toolkit";
import { selectIsInitialized } from "../features/router/routerSlice";

/**
 * 处理错误的通用函数
 */
function processError(error: FetchBaseQueryError | SerializedError | undefined): string | null {
    if (!error) return null;
    
    if ('status' in error) {
        // FetchBaseQueryError
        return getUserFriendlyErrorMessage(error);
    } else if ('message' in error) {
        // SerializedError
        return error.message || "发生未知错误";
    }
    
    return "发生未知错误";
}

/**
 * 用于无限滚动的自定义hook
 */
export function useInfiniteBooks() {
    const dispatch = useAppDispatch();
    const initial = useAppSelector(selectIsInitialized);
    const searchParams = useAppSelector(selectSearchParams);
    const displayMode = useAppSelector(selectDisplayMode);
    
    // 只在无限滚动模式下使用，并且没有被跳过
    const shouldFetch = displayMode === "infinite" && initial;
    const { data, error, isLoading, isFetching } = useSearchBooksQuery(searchParams, {
        skip: !shouldFetch,
        refetchOnMountOrArgChange: false, // 利用缓存，不每次挂载都重新获取
        refetchOnFocus: false, // 不在窗口获得焦点时刷新
        refetchOnReconnect: false, // 不在网络重连时刷新，利用缓存
    });

    const [allBooks, setAllBooks] = useState<Book[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isUpdatingBooks, setIsUpdatingBooks] = useState(false);


    // 当搜索参数改变时重置数据
    useEffect(() => {
        if (searchParams.curr === 1) {
            setAllBooks([]);
            setHasMore(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.keyword, searchParams.tag, searchParams.source, searchParams.bookStatus, 
        searchParams.wordCountMin, searchParams.wordCountMax, searchParams.sort, 
        searchParams.updatePeriod, searchParams.purity]);

    // 处理数据更新
    useEffect(() => {
        if (data?.data?.list && data.code === '200') {
            // 检查业务逻辑错误
            const businessError = checkBusinessError(data);
            if (businessError.isError) {
                console.error("业务逻辑错误:", businessError.message);
                // 发生错误时回滚到上次成功状态
                dispatch(rollbackToLastSuccessfulState());
                return;
            }
            
            setIsUpdatingBooks(true); // 开始更新书籍数据
            
            // 使用 setTimeout 确保状态更新是异步的，防止阻塞渲染
            setTimeout(() => {
                const newBooks = data.data.list;
                const totalCount = parseInt(data.data.total);
                const currentPage = parseInt(data.data.pageNum);
                const pageSize = parseInt(data.data.pageSize);

                if (currentPage === 1) {
                    setAllBooks(newBooks);
                } else {
                    setAllBooks(prev => [...prev, ...newBooks]);
                }

                // 检查是否还有更多数据
                setHasMore(currentPage * pageSize < totalCount);
                
                // 保存成功的搜索状态
                dispatch(saveSuccessfulState());
                
                // 书籍数据更新完成
                setIsUpdatingBooks(false);
            }, 0);
        }
    }, [data, dispatch]);

    // 处理 API 错误
    useEffect(() => {
        if (error) {
            console.error("API 请求错误:", error);
            // 发生错误时回滚到上次成功状态
            dispatch(rollbackToLastSuccessfulState());
        }
    }, [error, dispatch]);

    const loadMore = useCallback(() => {
        if (!isLoading && !isFetching && !isUpdatingBooks && hasMore) {
            dispatch(incrementPage());
        }
    }, [dispatch, isLoading, isFetching, isUpdatingBooks, hasMore]);

    const refresh = useCallback(() => {
        dispatch(resetToFirstPage());
    }, [dispatch]);

    // 组合加载状态：只有当 RTK Query 不在加载且书籍数据不在更新时，才认为不在加载
    const combinedIsLoading = isLoading || isFetching || isUpdatingBooks;

    // 处理错误信息
    const errorMessage = processError(error);

    return {
        books: allBooks,
        isLoading: combinedIsLoading,
        hasMore,
        loadMore,
        refresh,
        error: errorMessage,
        totalCount: data?.data ? parseInt(data.data.total) : 0,
    };
}

/**
 * 用于分页的自定义hook
 */
export function usePaginatedBooks() {
    const dispatch = useAppDispatch();
    const searchParams = useAppSelector(selectSearchParams);
    const displayMode = useAppSelector(selectDisplayMode);
    const initial = useAppSelector(selectIsInitialized);

    // 只在分页模式下使用，并且没有被跳过
    const shouldFetch = displayMode === "pagination" && initial;

    const { data, error, isLoading, isFetching } = useSearchBooksQuery(searchParams, {
        skip: !shouldFetch,
        refetchOnMountOrArgChange: false, // 利用缓存，不每次挂载都重新获取
        refetchOnFocus: false, // 不在窗口获得焦点时刷新
        refetchOnReconnect: false, // 不在网络重连时刷新，利用缓存
    });

    const [books, setBooks] = useState<Book[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isUpdatingBooks, setIsUpdatingBooks] = useState(true);

    // 处理数据更新
    useEffect(() => {
        if (data?.data?.list && data.code === '200') {
            // 检查业务逻辑错误
            const businessError = checkBusinessError(data);
            if (businessError.isError) {
                console.error("业务逻辑错误:", businessError.message);
                // 发生错误时回滚到上次成功状态
                dispatch(rollbackToLastSuccessfulState());
                return;
            }
            
            setIsUpdatingBooks(true); // 开始更新书籍数据
            
            // 使用 setTimeout 确保状态更新是异步的，防止阻塞渲染
            setTimeout(() => {
                const currentPage = parseInt(data.data.pageNum);
                setBooks(data.data.list);
                setCurrentPage(currentPage);
                console.log("📖 usePaginatedBooks - 更新书籍数据:", data.data.list);
                
                // 保存成功的搜索状态
                dispatch(saveSuccessfulState());
                
                setIsUpdatingBooks(false); // 书籍数据更新完成
            }, 0);
        }
    }, [data, dispatch]);

    // 处理 API 错误
    useEffect(() => {
        if (error) {
            console.error("API 请求错误:", error);
            // 发生错误时回滚到上次成功状态
            dispatch(rollbackToLastSuccessfulState());
        }
    }, [error, dispatch]);

    const changePage = useCallback((page: number) => {
        if (process.env.NEXT_PUBLIC_DEBUG === "true") {
            console.log("📖 usePaginatedBooks - 切换页码:", {
                from: searchParams.curr,
                to: page
            });
        }
        dispatch(setSearchParams({ curr: page }));
    }, [dispatch, searchParams.curr]);

    // 组合加载状态：只有当 RTK Query 不在加载且书籍数据不在更新时，才认为不在加载
    const combinedIsLoading = isLoading || isFetching || isUpdatingBooks;

    // 处理错误信息
    const errorMessage = processError(error);

    return {
        books: books,
        isLoading: combinedIsLoading,
        error: errorMessage,
        totalCount: data?.data ? parseInt(data.data.total) : 0,
        currentPage: currentPage,
        pageSize: data?.data ? parseInt(data.data.pageSize) : 20,
        changePage,
    };
}

/**
 * 用于手动触发搜索的hook
 */
export function useLazyBooks() {
    const dispatch = useAppDispatch();
    const [triggerSearch, { data, error, isLoading, isFetching }] = useLazySearchBooksQuery();
    const [books, setBooks] = useState<Book[]>([]);
    const [isUpdatingBooks, setIsUpdatingBooks] = useState(false);

    // 处理数据更新
    useEffect(() => {
        if (data?.data?.list) {
            // 检查业务逻辑错误
            const businessError = checkBusinessError(data);
            if (businessError.isError) {
                console.error("业务逻辑错误:", businessError.message);
                // 发生错误时回滚到上次成功状态
                dispatch(rollbackToLastSuccessfulState());
                return;
            }
            
            setIsUpdatingBooks(true); // 开始更新书籍数据
            
            // 使用 setTimeout 确保状态更新是异步的，防止阻塞渲染
            setTimeout(() => {
                setBooks(data.data.list);
                
                // 保存成功的搜索状态
                dispatch(saveSuccessfulState());
                
                setIsUpdatingBooks(false); // 书籍数据更新完成
            }, 0);
        }
    }, [data, dispatch]);

    // 处理 API 错误
    useEffect(() => {
        if (error) {
            console.error("API 请求错误:", error);
            // 发生错误时回滚到上次成功状态
            dispatch(rollbackToLastSuccessfulState());
        }
    }, [error, dispatch]);

    const search = useCallback((params: BookSearchParams) => {
        if (process.env.NEXT_PUBLIC_DEBUG === "true") {
            console.log("🔍 useLazyBooks - 手动触发搜索:", params);
        }
        return triggerSearch(params);
    }, [triggerSearch]);

    // 组合加载状态：只有当 RTK Query 不在加载且书籍数据不在更新时，才认为不在加载
    const combinedIsLoading = isLoading || isFetching || isUpdatingBooks;

    // 处理错误信息
    const errorMessage = processError(error);

    return {
        search,
        data,
        error: errorMessage,
        isLoading: combinedIsLoading,
        books: books,
        totalCount: data?.data ? parseInt(data.data.total) : 0,
    };
}
