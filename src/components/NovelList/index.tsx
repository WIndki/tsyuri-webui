"use client";
import React, { useEffect, useRef, useCallback, memo, useMemo } from "react";
import { Row, Col, Spin, Empty } from "antd";
import BookCard from "../NovelCard";
import type { Book } from "../../types/book";

interface NovelListProps {
    books: Book[];
    loading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    pageSize?: number;
    emptyText?: string;
}

const NovelList: React.FC<NovelListProps> = ({
    books,
    loading,
    hasMore,
    onLoadMore,
    emptyText = "暂无小说",
}) => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    console.log("NovelistRendered");
    // 处理无限滚动加载
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries;
            if (entry.isIntersecting && hasMore && !loading) {
                onLoadMore();
            }
        },
        [hasMore, loading, onLoadMore]
    );

    // 设置 Intersection Observer
    useEffect(() => {
        if (books.length === 0) return;
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
        return books.map((book) => (
            <Col key={book.id} span={8} xs={24} sm={12} md={8} lg={6}>
                <BookCard book={book} />
            </Col>
        ));
    }, [books]);

    return (
        <>
            {books.length === 0 && !loading ? (
                <Empty description={emptyText} />
            ) : (
                <Row
                    justify="center"
                    align="top"
                    gutter={[16, 16]}
                    style={{ margin: "0 auto", maxWidth: "100rem" }}
                >
                    {bookList}
                </Row>
            )}

            <div
                ref={loadMoreRef}
                style={{
                    textAlign: "center",
                    marginTop: 16,
                    marginBottom: 16,
                    height: 32,
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
