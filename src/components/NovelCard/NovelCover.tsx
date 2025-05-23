import React from "react";
import { Typography } from "antd";
import type { Book } from "../../types/book";
import styles from "./styles.module.css";

const { Text } = Typography;

interface NovelCoverProps {
    book: Book;
}

const NovelCover: React.FC<NovelCoverProps> = ({ book }) => {
    return (
        <div className={styles.coverContainer}>
            <img
                alt={book.bookName}
                src={book.picUrl}
                className={styles.coverImage}
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/book-placeholder.jpg";
                }}
            />
            <div className={styles.titleOverlay}>
                <Text className={styles.title} ellipsis>
                    {book.bookName}
                </Text>
            </div>
        </div>
    );
};

export default NovelCover;
