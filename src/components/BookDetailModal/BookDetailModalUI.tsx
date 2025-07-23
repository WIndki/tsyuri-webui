;
import React from "react";
import { Typography, Divider, Skeleton } from "antd";
import type { Book } from "@/types/book";
import BookCover from "./BookCover";
import BookInfo from "./BookInfo";
import BookTags from "./BookTags";
import styles from "./styles.module.css";
import dynamic from "next/dynamic";

const { Paragraph } = Typography;

interface BookDetailModalUIProps {
    book: Book;
    processBookDetail: (book: Book) => Book;
    formatBookWordCount: (wordCount: string) => string;
    formatBookUpdateTime: (time: string) => string;
}

/**
 * BookDetailModalUI 组件 - 专门负责书籍详情模态框的UI渲染
 * @param props BookDetailModalUIProps
 * @returns JSX.Element
 */
const BookDetailModalUI: React.FC<BookDetailModalUIProps> = ({ 
    book,
    processBookDetail,
    // formatBookWordCount,
    // formatBookUpdateTime
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("BookDetailModalUI render");
    }
    
    // 处理书籍详情显示
    const processedBook = processBookDetail(book);

    return (
        <>
            <div className={styles.bookDetailContainer}>
                <BookCover picUrl={processedBook.picUrl} bookName={processedBook.bookName} />
                <BookInfo book={processedBook} />
            </div>
            <Divider orientation="left">简介</Divider>
            <Paragraph>{processedBook.bookDesc}</Paragraph>

            <Divider orientation="left">标签</Divider>
            <BookTags tag={processedBook.tag} purity={processedBook.purity} />
        </>
    );
};

BookDetailModalUI.displayName = "BookDetailModalUI";

export default dynamic(() => Promise.resolve(BookDetailModalUI), {
    ssr: true,
    loading: () => <Skeleton />
});
