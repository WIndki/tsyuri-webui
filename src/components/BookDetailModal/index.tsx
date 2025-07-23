import React from "react";
import { useBookDetailModal } from "./useBookDetailModal";
import BookDetailModalUI from "./BookDetailModalUI";
import type { Book } from "@/types/book";

interface BookDetailModalProps {
    book: Book;
}

/**
 * BookDetailModal 组件 - 书籍详情主组件，组合了业务逻辑和UI渲染
 * @param props BookDetailModalProps
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useBookDetailModal hook 中，UI 渲染由 BookDetailModalUI 组件负责。
 */
const BookDetailModal: React.FC<BookDetailModalProps> = ({ book }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("BookDetailModal render");
    }

    // 使用自定义hook获取业务逻辑
    const { 
        processBookDetail,
        formatBookWordCount,
        formatBookUpdateTime
    } = useBookDetailModal();

    return (
        <BookDetailModalUI
            book={book}
            processBookDetail={processBookDetail}
            formatBookWordCount={formatBookWordCount}
            formatBookUpdateTime={formatBookUpdateTime}
        />
    );
};

BookDetailModal.displayName = "BookDetailModal";

export default React.memo(BookDetailModal);
