;
import React, { useCallback, } from "react";
import { App } from "antd";
import { useNovelListPagination } from "./useNovelListPagination";
import NovelListPaginationUI from "./NovelListPaginationUI";
import BookDetailModal from "@/components/BookDetailModal";
import { Book } from "@/types/book";

/**
 * NovelListPaginationProps 接口定义了分页小说列表组件所需的属性
 * @interface NovelListPaginationProps
 * @property {string} [emptyText] - 当没有小说时显示的文本，默认为 "暂无小说"
 */
interface NovelListPaginationProps {
    emptyText?: string;
}

/**
 * NovelListPagination 组件 - 分页小说列表主组件，组合了业务逻辑和UI渲染
 * @param {NovelListPaginationProps} props - 分页小说列表组件属性
 * @returns {JSX.Element} 分页小说列表组件
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useNovelListPagination hook 中，UI 渲染由 NovelListPaginationUI 组件负责。
 */
const NovelListPagination: React.FC<NovelListPaginationProps> = ({ 
    emptyText = "暂无小说" 
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("NovelListPagination render");
    }
    
    const { modal } = App.useApp();
    const {
        books,
        isLoading,
        totalCount,
        currentPage,
        pageSize,
        changePage,
        error,
        handlePageChange,
        handleRetryLoadData,
        dispatch
    } = useNovelListPagination();

    // 展示小说详情Modal
    const showBookDetailModal = useCallback(
        (book: Book) => {
            modal.info({
                title: "小说详情",
                footer: null,
                width: 700,
                centered: true,
                maskClosable: true,
                closable: true,
                icon: null,
                open: true,
                styles: {
                    mask: {
                        backdropFilter: "blur(8px)",
                        background: "rgba(0, 0, 0, 0.5)",
                    },
                    content: {
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        maxHeight: "80vh",
                        overflowY: "auto",
                        overscrollBehavior: "contain",
                    },
                    header: {
                        color: "#d80000",
                    },
                },
                content: <BookDetailModal book={book} />,
            });
        },
        [modal]
    );

    // 处理BookCard点击事件
    const handleBookCardClick = useCallback(
        (book: Book) => {
            showBookDetailModal(book);
        },
        [showBookDetailModal]
    );

    // 处理分页变化
    const handlePaginationChange = useCallback(
        (page: number, newPageSize?: number) => {
            handlePageChange(
                page,
                newPageSize,
                isLoading,
                pageSize,
                changePage,
                dispatch
            );
        },
        [handlePageChange, isLoading, pageSize, changePage, dispatch]
    );

    // 重试函数
    const handleRetry = useCallback(() => {
        handleRetryLoadData(currentPage, changePage);
    }, [handleRetryLoadData, currentPage, changePage]);

    return (
        <NovelListPaginationUI
            emptyText={emptyText}
            books={books}
            isLoading={isLoading}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            error={error}
            onBookClick={handleBookCardClick}
            onPageChange={handlePaginationChange}
            onRetryLoadData={handleRetry}
        />
    );
};

NovelListPagination.displayName = "NovelListPagination";

export default React.memo(NovelListPagination);
