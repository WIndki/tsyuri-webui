import React from "react";
import { Typography, Divider } from "antd";
import type { Book } from "@/types/book";
import BookCover from "./BookCover";
import BookInfo from "./BookInfo";
import BookTags from "./BookTags";
import styles from "./styles.module.css";

const { Paragraph } = Typography;

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

export default BookDetailModal;
