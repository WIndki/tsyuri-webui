import React from "react";
import { Image, Spin } from "antd";
import type { Book } from "@/types/book";
import styles from "../styles.module.css";

interface NovelCoverUIProps {
    book: Book;
    onImageError: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
    onCardClick?: () => void;
}

/**
 * NovelCoverUI 组件 - 专门负责小说封面的UI渲染
 * @param props NovelCoverUIProps
 * @returns JSX.Element
 */
const NovelCoverUI: React.FC<NovelCoverUIProps> = ({ 
    book, 
    onImageError,
    onCardClick
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("NovelCoverUI render");
    }

    return (
        <Image
            className={styles.coverImage}
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
            onError={onImageError}
            onClick={onCardClick}
        />
    );
};

export default React.memo(NovelCoverUI);
