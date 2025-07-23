import React from "react";
import { useBookInfo } from "./useBookInfo";
import BookInfoUI from "./BookInfoUI";
import type { Book } from "@/types/book";

interface BookInfoProps {
    book: Book;
}

/**
 * BookInfo 组件 - 书籍信息主组件，组合了业务逻辑和UI渲染
 * @param props BookInfoProps
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useBookInfo hook 中，UI 渲染由 BookInfoUI 组件负责。
 */
const BookInfo: React.FC<BookInfoProps> = ({ book }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("BookInfo render");
    }

    // 使用自定义hook获取业务逻辑
    const { 
        formatWordCount, 
        getStatusText, 
        copyBookName, 
        searchBook 
    } = useBookInfo();

    return (
        <BookInfoUI
            book={book}
            formatWordCount={formatWordCount}
            getStatusText={getStatusText}
            onCopyBookName={copyBookName}
            onSearchBook={searchBook}
        />
    );
};

export default BookInfo;
