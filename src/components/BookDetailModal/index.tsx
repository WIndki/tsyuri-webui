import React from "react";
import { Typography, Divider } from "antd";
import type { Book } from "@/types/book";
import BookCover from "./BookCover";
import BookInfo from "./BookInfo";
import BookTags from "./BookTags";
import styles from "./styles.module.css";

const { Paragraph } = Typography;

/**
 * BookDetailModalProps 接口定义了书籍详情模态框组件所需的属性
 * @interface BookDetailModalProps
 * @property {Book} book - 需要显示详情的书籍对象
 */
interface BookDetailModalProps {
    book: Book;
}

const BookDetailModal: React.FC<BookDetailModalProps> = ({ book }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("BookDetailModal render");
    }
    return (
        <>
            <div className={styles.bookDetailContainer}>
                <BookCover picUrl={book.picUrl} bookName={book.bookName} />
                <BookInfo book={book} />
            </div>
            <Divider orientation="left">简介</Divider>
            <Paragraph>{book.bookDesc}</Paragraph>

            <Divider orientation="left">标签</Divider>
            <BookTags tag={book.tag} purity={book.purity} />
        </>
    );
};
BookDetailModal.displayName = "BookDetailModal";
// BookDetailModal 组件用于展示书籍的详细信息，包括封面、书名、作者、字数、更新时间等

export default BookDetailModal;
