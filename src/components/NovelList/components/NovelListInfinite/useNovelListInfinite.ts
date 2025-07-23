"use client";
import { useCallback } from "react";
import { useInfiniteBooks } from "@/lib";
import { Book } from "@/types/book";

/**
 * useNovelListInfinite Hook - 封装无限滚动小说列表的业务逻辑
 * @returns {Object} 包含无限滚动小说列表相关业务逻辑的对象
 */
export const useNovelListInfinite = () => {
    // 获取查询参数
    // const searchParams = useSearchParams();
    
    // 使用书籍相关的自定义Hook
    const { 
        books, 
        isLoading, 
        hasMore, 
        error, 
        loadMore, 
        refresh
    } = useInfiniteBooks();

    /**
     * 处理书籍点击事件
     */
    const handleBookClick = useCallback((book: Book) => {
        // 这里可以添加书籍点击的业务逻辑
        console.log("Book clicked:", book);
    }, []);

    return {
        books,
        isLoading,
        hasMore,
        error,
        loadMore,
        refresh,
        handleBookClick
    };
};
