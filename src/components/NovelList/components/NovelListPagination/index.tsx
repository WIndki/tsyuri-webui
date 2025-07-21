"use client";
import React, { useCallback, memo, useMemo, useEffect, useRef } from "react";
import { Row, App, Pagination } from "antd";
import BookCard from "@/components/NovelCard";
import BookDetailModal from "@/components/BookDetailModal";
import { Book } from "@/types/book";
import LoadingIndicator from "../LoadingIndicator";
import EmptyState from "../EmptyState";
import { usePaginatedBooks, useAppDispatch, useAppSelector, useErrorHandler } from "@/lib";
import { setSearchParams, selectSearchParams } from "@/lib";
import styles from "../../styles.module.css";

/**
 * NovelListPaginationProps 接口定义了分页小说列表组件所需的属性
 * @interface NovelListPaginationProps
 * @property {string} [emptyText] - 当没有小说时显示的文本，默认为 "暂无小说"
 */
interface NovelListPaginationProps {
    emptyText?: string;
}

/**
 * 分页小说列表组件
 * 用于展示小说列表，支持分页加载和小说详情查看
 * @param {NovelListPaginationProps} props - 分页小说列表组件属性
 * @returns {JSX.Element} 分页小说列表组件
 */
const NovelListPagination: React.FC<NovelListPaginationProps> = ({ 
    emptyText = "暂无小说" 
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("NovelListPagination render");
    }
    
    const dispatch = useAppDispatch();
    const searchParams = useAppSelector(selectSearchParams);
    const { modal } = App.useApp();
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
    const handlePageChange = useCallback(
        (page: number, newPageSize?: number) => {
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
        },
        [isLoading, pageSize, changePage, dispatch, searchParams]
    );

    // 重试函数
    const handleRetryLoadData = useCallback(() => {
        // RTK Query 会自动重试，这里可以触发重新获取
        changePage(currentPage);
    }, [changePage, currentPage]);

    // 使用 useMemo 缓存书籍列表，避免不必要的重新渲染
    const bookList = useMemo(() => {
        return books.map((book: Book, index: number) => (
            <BookCard
                key={book.id || index}
                book={book}
                onCardClick={handleBookCardClick}
            />
        ));
    }, [books, handleBookCardClick]);

    return (
        <>
            {books.length === 0 && !isLoading && !error ? (
                <EmptyState
                    description={emptyText}
                    showRetry={true}
                    onRetry={handleRetryLoadData}
                    loading={isLoading}
                />
            ) : (
                <>
                {isLoading && (
                    <LoadingIndicator type="overlay" visible={true} />
                )}
                    <Row
                        justify="center"
                        align="top"
                        gutter={[16, 16]}
                        style={{
                            margin: "0 auto",
                            padding: "1rem 0.25rem",
                            maxWidth: "100rem",
                            minHeight: "60vh", // 确保有最小高度
                        }}
                    >
                        {bookList}
                    </Row>
                    
                    {/* 分页器 */}
                    <div className={styles.paginationContainer}>
                        <Pagination
                            style={{ margin: "0 0" }}
                            current={currentPage}
                            total={totalCount}
                            pageSize={pageSize}
                            showSizeChanger={true}
                            showQuickJumper={true}
                            showTotal={(total, range) =>
                                `第 ${range[0]}-${range[1]} 项，共 ${total} 项`
                            }
                            onChange={handlePageChange}
                            disabled={isLoading}
                            pageSizeOptions={['10', '20', '30', '50']}
                            size="default"
                        />
                    </div>
                </>
            )}
        </>
    );
};

NovelListPagination.displayName = "NovelListPagination";

export default memo(NovelListPagination);
