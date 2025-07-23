"use client";
import React, { useMemo } from "react";
import { Row } from "antd";
import BookCard from "@/components/NovelCard";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingIndicator from "../LoadingIndicator/index";
import EmptyState from "../EmptyState/index";
import styles from "../../styles.module.css";
import type { Book } from "@/types/book";

/**
 * NovelListInfiniteUIProps 接口定义了 NovelListInfiniteUI 组件所需的属性
 * @interface NovelListInfiniteUIProps
 * @property {string} [emptyText] - 当没有小说时显示的文本，默认为 "暂无小说"
 * @property {Book[]} books - 书籍列表
 * @property {boolean} isLoading - 是否正在加载
 * @property {boolean} hasMore - 是否还有更多数据
 * @property {function} loadMore - 加载更多数据的函数
 * @property {function} refresh - 刷新数据的函数
 * @property {string | null} error - 错误信息
 * @property {function} onBookClick - 书籍点击回调函数
 */
interface NovelListInfiniteUIProps {
  emptyText?: string;
  books: Book[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  error: string | null;
  onBookClick: (book: Book) => void;
}

/**
 * NovelListInfiniteUI 组件 - 专门负责无限滚动小说列表的UI渲染
 * @param {NovelListInfiniteUIProps} props - 组件属性
 * @returns {JSX.Element} 无限滚动小说列表UI组件
 */
const NovelListInfiniteUI: React.FC<NovelListInfiniteUIProps> = ({
  emptyText = "暂无小说",
  books,
  isLoading,
  hasMore,
  loadMore,
  refresh,
  error,
  onBookClick
}) => {
  if (process.env.NEXT_PUBLIC_DEBUG === "true") {
    console.log("NovelListInfiniteUI render");
  }

  // 使用 useMemo 缓存书籍列表，避免不必要的重新渲染
  const bookList = useMemo(() => {
    return books.map((book, index) => (
      <BookCard
        key={index}
        book={book}
        onCardClick={onBookClick}
      />
    ));
  }, [books, onBookClick]);

  return (
    <>
      {!hasMore && books.length === 0 && !isLoading && !error ? (
        <EmptyState
          description={emptyText}
          showRetry={true}
          onRetry={refresh}
          loading={isLoading}
        />
      ) : (
        <InfiniteScroll
          dataLength={books.length}
          next={loadMore}
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

export default React.memo(NovelListInfiniteUI);
