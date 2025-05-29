import React from "react";
import { Image, Spin, Typography } from "antd";
import type { Book } from "../../types/book";
import styles from "./styles.module.css";

const { Text } = Typography;

/**
 * NovelCoverProps 接口定义了 NovelCover 组件所需的属性
 * @interface NovelCoverProps
 * @property {Book} book - 书籍对象，包含封面图片和书名等信息
 */
interface NovelCoverProps {
    book: Book;
}

const NovelCover: React.FC<NovelCoverProps> = ({ book }) => {
    return (
        <div className={styles.coverContainer}>
            {/* <img
                alt={book.bookName}
                src={book.picUrl}
                className={styles.coverImage}
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/book-placeholder.jpg";
                }}
            /> */}
            <Image
                className={styles.coverImage}
                width={"100%"}
                height={"100%"}
                src={book.picUrl}
                alt={book.bookName}
                decoding="async"
                loading="lazy"
                preview={false}
                placeholder={
                    <div className={styles.spinContainer}>
                        <Spin size="large" className={styles.spinner} />
                    </div>
                }
                fallback="/images/book-placeholder.jpg"
            />
            <div className={styles.titleOverlay}>
                <Text className={styles.title} ellipsis>
                    {book.bookName}
                </Text>
            </div>
        </div>
    );
};

export default React.memo(NovelCover);
