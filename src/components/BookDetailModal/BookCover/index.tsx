import React from "react";
import { useBookCover } from "./useBookCover";
import BookCoverUI from "./BookCoverUI";

interface BookCoverProps {
    picUrl: string;
    bookName: string;
}

/**
 * BookCover 组件 - 书籍封面主组件，组合了业务逻辑和UI渲染
 * @param props BookCoverProps
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useBookCover hook 中，UI 渲染由 BookCoverUI 组件负责。
 */
const BookCover: React.FC<BookCoverProps> = ({ picUrl, bookName }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("BookCover render");
    }

    // 使用自定义hook获取业务逻辑
    const { handleImageError } = useBookCover();

    return (
        <BookCoverUI
            picUrl={picUrl}
            bookName={bookName}
            onImageError={handleImageError}
        />
    );
};

export default BookCover;
