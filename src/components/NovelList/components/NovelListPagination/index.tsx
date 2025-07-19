"use client";
import React, { useCallback, memo, useMemo, useEffect, useRef } from "react";
import { Row, App, Pagination } from "antd";
import BookCard from "@/components/NovelCard";
import { RootState } from "@/redux/store";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { searchBooksWithPagination, setSearchParams } from "@/redux/slices/booksSlice";
import BookDetailModal from "@/components/BookDetailModal";
import { Book } from "@/types/book";
import LoadingIndicator from "../LoadingIndicator";
import EmptyState from "../EmptyState";
import useErrorHandler from "../../hooks/useErrorHandler";
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
    const { modal } = App.useApp();
    const { books, loading, searchParams, totalCount, lastSuccessfulPage } = useAppSelector(
        (state: RootState) => state.books
    );
    
    // 使用统一的错误处理Hook，错误会自动通过模态框显示
    const { error, retry: handleRetryLoadData } = useErrorHandler();
    
    // 使用 useRef 来跟踪当前请求的页码
    const pendingPageRef = useRef<number | null>(null);

    // 从状态中获取分页信息
    const { currentPage, pageSize } = useMemo(() => {
        return {
            currentPage: searchParams.curr,
            pageSize: searchParams.limit,
        };
    }, [searchParams.curr, searchParams.limit]);

    // 监听最后成功页码变化，请求成功后滚动到顶部
    useEffect(() => {
        // 当lastSuccessfulPage变化且等于当前期望的页码时，表示请求成功
        if (lastSuccessfulPage !== null && lastSuccessfulPage === pendingPageRef.current) {
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // 清除pending状态
            pendingPageRef.current = null;
        }
    }, [lastSuccessfulPage]);

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
        (page: number, pageSize?: number) => {
            if (loading) return;
            
            // 记录即将请求的页码
            pendingPageRef.current = page;

            const newParams = {
                ...searchParams,
                curr: page,
                limit: pageSize || searchParams.limit,
            };

            dispatch(setSearchParams(newParams));
            dispatch(searchBooksWithPagination(newParams));
        },
        [loading, searchParams, dispatch]
    );

    // 使用 useMemo 缓存书籍列表，避免不必要的重新渲染
    const bookList = useMemo(() => {
        return books.map((book, index) => (
            <BookCard
                key={book.id || index}
                book={book}
                onCardClick={handleBookCardClick}
            />
        ));
    }, [books, handleBookCardClick]);

    return (
        <>
            {books.length === 0 && !loading && !error ? (
                <EmptyState 
                    description={emptyText}
                    showRetry={true}
                    onRetry={handleRetryLoadData}
                    loading={loading}
                />
            ) : (
                <>
                {loading && (
                    <LoadingIndicator type="overlay" visible={loading} />
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
                            disabled={loading}
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
