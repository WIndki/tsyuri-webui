import React from "react";
import { Image, Spin } from "antd";
import styles from "../styles.module.css";

interface BookCoverUIProps {
    picUrl: string;
    bookName: string;
    onImageError: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * BookCoverUI 组件 - 专门负责书籍封面的UI渲染
 * @param props BookCoverUIProps
 * @returns JSX.Element
 */
const BookCoverUI: React.FC<BookCoverUIProps> = ({ 
    picUrl, 
    bookName,
    onImageError
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("BookCoverUI render");
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
            onError={onImageError}
        />
    );
};

export default BookCoverUI;
