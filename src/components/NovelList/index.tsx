"use client";
import React, { useCallback, memo, useMemo } from "react";
import { Row, Col, Empty, App, Spin } from "antd";
import BookCard from "@/components/NovelCard";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useAppDispatch } from "@/redux/hooks";
import { searchBooks, setSearchParams } from "@/redux/slices/booksSlice";
import BookDetailModal from "@/components/BookDetailModal";
import { Book } from "@/types/book";
import InfiniteScroll from "react-infinite-scroll-component";
import styles from "./styles.module.css";

/**
 * NovelListProps 接口定义了 NovelList 组件所需的属性
 * @interface NovelListProps
 * @property {string} [emptyText] - 当没有小说时显示的文本，默认为 "暂无小说"
 */
interface NovelListProps {
    emptyText?: string;
}
/**
 * 小说列表组件
 * 用于展示小说列表，支持无限滚动加载和小说详情查看
 * @param {NovelListProps} props - 小说列表组件属性
 * @returns {JSX.Element} 小说列表组件
 * @description
 * 该组件使用了 Redux 来管理状态，使用了 react-infinite-scroll-component 来实现无限滚动加载。
 * 当用户滚动到页面底部时，会自动加载更多小说数据。
 * 组件还提供了一个 Modal 来展示小说详情，用户可以点击小说卡片查看详细信息。
 * @example
 */
const NovelList: React.FC<NovelListProps> = ({ emptyText = "暂无小说" }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("NovelList render");
    }
    const dispatch = useAppDispatch();
    const { modal } = App.useApp();
    const { books, loading, hasMore, searchParams, error } = useSelector(
        (state: RootState) => state.books
    );

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
    }, [loading, hasMore, searchParams, dispatch]);

    // 使用 useMemo 缓存书籍列表，避免不必要的重新渲染
    const bookList = useMemo(() => {
        return books.map((book, index) => (
            <Col key={index} span={8} xs={24} sm={12} md={8} lg={6}>
                <BookCard
                    book={book}
                    onCardClick={() => handleBookCardClick(book)}
                />
            </Col>
        ));
    }, [books, handleBookCardClick]);

    return (
        <>
            {books.length === 0 && !loading ? (
                <Empty description={emptyText} />
            ) : (
                <InfiniteScroll
                    dataLength={books.length}
                    next={loadMoreData}
                    hasMore={hasMore}
                    loader={
                        <div className={styles.loadMoreContainer}>
                            <Spin />
                        </div>
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
                        style={{ margin: "0 auto" }}
                    >
                        {bookList}
                    </Row>
                </InfiniteScroll>
            )}
        </>
    );
};

export default memo(NovelList);
