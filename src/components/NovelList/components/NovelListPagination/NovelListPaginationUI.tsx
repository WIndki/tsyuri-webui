;
import React, { useMemo } from "react";
import { Row, Pagination } from "antd";
import BookCard from "@/components/NovelCard";
// import BookDetailModal from "@/components/BookDetailModal";
import LoadingIndicator from "@/components/NovelList/components/LoadingIndicator";
import EmptyState from "@/components/NovelList/components/EmptyState";
import { Book } from "@/types/book";
import styles from "../../styles.module.css";

interface NovelListPaginationUIProps {
    emptyText?: string;
    books: Book[];
    isLoading: boolean;
    totalCount: number;
    currentPage: number;
    pageSize: number;
    error: string | null;
    onBookClick: (book: Book) => void;
    onPageChange: (page: number, pageSize?: number) => void;
    onRetryLoadData: () => void;
}

/**
 * NovelListPaginationUI 组件 - 专门负责分页小说列表的UI渲染
 * @param props NovelListPaginationUIProps
 * @returns JSX.Element
 */
const NovelListPaginationUI: React.FC<NovelListPaginationUIProps> = ({
    emptyText = "暂无小说",
    books,
    isLoading,
    totalCount,
    currentPage,
    pageSize,
    error,
    onBookClick,
    onPageChange,
    onRetryLoadData
}) => {
    // const { modal } = App.useApp();

    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("NovelListPaginationUI render");
    }

    // 使用 useMemo 缓存书籍列表，避免不必要的重新渲染
    const bookList = useMemo(() => {
        return books.map((book: Book, index: number) => (
            <BookCard
                key={book.id || index}
                book={book}
                onCardClick={onBookClick}
            />
        ));
    }, [books, onBookClick]);

    return (
        <>
            {books.length === 0 && !isLoading && !error ? (
                <EmptyState
                    description={emptyText}
                    showRetry={true}
                    onRetry={onRetryLoadData}
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
                            onChange={onPageChange}
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

export default React.memo(NovelListPaginationUI);
