import React from "react";
import { Image, Spin } from "antd";
import styles from "./styles.module.css";

/**
 * BookCoverProps 接口定义了书籍封面组件所需的属性
 * @interface BookCoverProps
 * @property {string} picUrl - 书籍封面图片URL
 * @property {string} bookName - 书籍名称，用作图片的alt属性
 */
interface BookCoverProps {
    picUrl: string;
    bookName: string;
}

const BookCover: React.FC<BookCoverProps> = ({ picUrl, bookName }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("BookCover render");
    }
    return (
        <Image
            className={styles.bookCover}
            height={300}
            width={200}
            src={picUrl}
            alt={bookName}
            fallback="/images/book-placeholder.jpg"
            placeholder={
                <div className={styles.spinContainer}>
                    <Spin size="large" className={styles.spinner} />
                </div>
            }
        />
    );
};

export default BookCover;
