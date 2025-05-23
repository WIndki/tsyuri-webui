import React from "react";
import { Image, Spin } from "antd";
import styles from "./styles.module.css";

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
