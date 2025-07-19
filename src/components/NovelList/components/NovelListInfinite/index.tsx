"use client";
import React, { useCallback, memo, useMemo } from "react";
import { Row, App } from "antd";
import BookCard from "@/components/NovelCard";
import { RootState } from "@/redux/store";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { searchBooks, setSearchParams, clearError } from "@/redux/slices/booksSlice";
import BookDetailModal from "@/components/BookDetailModal";
import { Book } from "@/types/book";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingIndicator from "../LoadingIndicator";
import EmptyState from "../EmptyState";
import useErrorHandler from "../../hooks/useErrorHandler";
import styles from "../../styles.module.css";

/**
 * NovelListInfiniteProps 接口定义了无限滚动小说列表组件所需的属性
 * @interface NovelListInfiniteProps
 * @property {string} [emptyText] - 当没有小说时显示的文本，默认为 "暂无小说"
 */
interface NovelListInfiniteProps {
    emptyText?: string;
}

/**
 * 无限滚动小说列表组件
 * 用于展示小说列表，支持无限滚动加载和小说详情查看
 * @param {NovelListInfiniteProps} props - 无限滚动小说列表组件属性
 * @returns {JSX.Element} 无限滚动小说列表组件
 * @description
 * 该组件使用了 Redux 来管理状态，使用了 react-infinite-scroll-component 来实现无限滚动加载。
 * 当用户滚动到页面底部时，会自动加载更多小说数据。
 * 组件还提供了一个 Modal 来展示小说详情，用户可以点击小说卡片查看详细信息。
 */
const NovelListInfinite: React.FC<NovelListInfiniteProps> = ({ emptyText = "暂无小说" }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("NovelListInfinite render");
    }
    const dispatch = useAppDispatch();
    const { modal } = App.useApp();
    const { books, loading, hasMore, searchParams } = useAppSelector(
        (state: RootState) => state.books
    );
    
    // 使用统一的错误处理Hook，错误会自动通过模态框显示
    const { error, retry: handleRetryLoadData } = useErrorHandler();

    // 展示小说详情Modal
    const showBookDetailModal = useCallback(
        (book: Book) => {
            modal.info({
                title: "小说详情",
                footer: null,
                width: 700,
                // destroyOnClose: true,
                // destroyOnHidden: true,
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

    // 加载更多数据
    const loadMoreData = useCallback(() => {
        if (loading || !hasMore || error) return;

        const nextPage = searchParams.curr + 1;
        const newParams = {
            ...searchParams,
            curr: nextPage,
        };

        dispatch(setSearchParams(newParams));
        dispatch(searchBooks(newParams));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, hasMore, searchParams, dispatch]);

    // 使用 useMemo 缓存书籍列表，避免不必要的重新渲染
    const bookList = useMemo(() => {
        return books.map((book, index) => (
            // 修改：直接使用 BookCard, Col is now inside BookCard
            <BookCard
                key={book.id || index} // 优先使用 book.id (如果存在)，否则回退到 index
                book={book}
                onCardClick={handleBookCardClick} // Pass the callback directly
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
                <InfiniteScroll
                    dataLength={books.length}
                    next={loadMoreData}
                    hasMore={hasMore && !error}
                    loader={
                        <LoadingIndicator type="center" />
                    }
                    endMessage={
                        <div className={styles.loadMoreContainer}>
                            已经到底了 ~
                        </div>
                    }
                    scrollThreshold={0.9}
                >
                    <Row
                        justify="center"
                        align="top"
                        gutter={[16, 16]}
                        style={{
                            margin: "0 auto",
                            padding: "1rem 0.25rem",
                            maxWidth: "100rem",
                        }}
                    >
                        {bookList}
                    </Row>
                </InfiniteScroll>
            )}
        </>
    );
};
NovelListInfinite.displayName = "NovelListInfinite";

export default memo(NovelListInfinite);
