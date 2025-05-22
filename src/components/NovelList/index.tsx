"use client";
import React, { useEffect, useRef, useCallback, memo, useMemo } from "react";
import { Row, Col, Spin, Empty, App } from "antd";
import BookCard from "../NovelCard";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useAppDispatch } from "@/redux/hooks";
import { searchBooks, setSearchParams } from "@/redux/slices/booksSlice";
import BookDetailModal from "../BookDetailModal";
import { Book } from "@/types/book";

interface NovelListProps {
    emptyText?: string;
}

const NovelList: React.FC<NovelListProps> = ({ emptyText = "暂无小说" }) => {
    const dispatch = useAppDispatch();
    const { modal } = App.useApp();
    const { books, loading, hasMore, searchParams, error } = useSelector(
        (state: RootState) => state.books
    );
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    console.log("NovelList render");
    // 展示小说详情Modal
    const showBookDetailModal = useCallback(
        (book: Book) => {
            modal.info({
                title: "小说详情",
                footer: null,
                width: 700,
                destroyOnClose: true,
                centered: true,
                maskClosable: true,
                closable: true,
                icon: null,
                styles: {
                    mask: {
                        backdropFilter: "blur(8px)",
                        background: "rgba(0, 0, 0, 0.5)",
                    },
                    content: {
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
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
        if (loading || !hasMore) return;

        const nextPage = searchParams.curr + 1;
        const newParams = {
            ...searchParams,
            curr: nextPage,
        };

        dispatch(setSearchParams(newParams));
        dispatch(searchBooks(newParams));
    }, [loading, hasMore, searchParams, dispatch]);

    // 处理无限滚动加载
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !loading) {
                loadMoreData();
            }
        },
        [hasMore, loading, loadMoreData]
    );

    // 设置 Intersection Observer
    useEffect(() => {
        if (books.length === 0 || error) return;
        const observer = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: "0px",
            threshold: 0.1,
        });

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        observerRef.current = observer;

        return () => observer.disconnect();
    }, [handleObserver]);

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
    }, [books]);

    return (
        <>
            {books.length === 0 && !loading ? (
                <Empty description={emptyText} />
            ) : (
                <Row justify="center" align="top" gutter={[16, 16]}>
                    {bookList}
                </Row>
            )}

            <div
                ref={loadMoreRef}
                style={{
                    textAlign: "center",
                    marginTop: 16,
                    marginBottom: 16,
                    height: "160px",
                }}
            >
                {loading && <Spin />}
                {!hasMore && books.length > 0 && (
                    <div style={{ color: "#999" }}>没有更多了</div>
                )}
            </div>
        </>
    );
};

export default memo(NovelList);
