import React from "react";
import { Typography, Descriptions, Button, Space } from "antd";
import type { Book } from "@/types/book";
import styles from "../styles.module.css";

const { Title } = Typography;

interface BookInfoUIProps {
    book: Book;
    formatWordCount: (wordCount: string) => string;
    getStatusText: (bookStatus: string) => string;
    onCopyBookName: (bookName: string) => void;
    onSearchBook: (bookName: string) => void;
}

/**
 * BookInfoUI 组件 - 专门负责书籍信息的UI渲染
 * @param props BookInfoUIProps
 * @returns JSX.Element
 */
const BookInfoUI: React.FC<BookInfoUIProps> = ({ 
    book,
    formatWordCount,
    getStatusText,
    onCopyBookName,
    onSearchBook
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("BookInfoUI render");
    }

    return (
        <div className={styles.bookInfo}>
            <Title level={3}>{book.bookName}</Title>
            <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="作者">
                    {book.authorName}
                </Descriptions.Item>
                <Descriptions.Item label="字数">
                    {formatWordCount(book.wordCount)}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                    {getStatusText(book.bookStatus)}
                </Descriptions.Item>
                <Descriptions.Item label="来源">
                    {book.crawlSourceName}
                </Descriptions.Item>
                <Descriptions.Item label="最后更新">
                    {new Date(book.lastIndexUpdateTime).toLocaleString()}
                </Descriptions.Item>
            </Descriptions>
            <Space className={styles.actionButtons} size={8}>
                <Button
                    type="primary"
                    onClick={() => onCopyBookName(book.bookName)}
                >
                    复制名称
                </Button>
                <Button
                    type="primary"
                    onClick={() => onSearchBook(book.bookName)}
                >
                    搜索该书
                </Button>
            </Space>
        </div>
    );
};

export default BookInfoUI;
