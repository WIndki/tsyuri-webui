;
import React, { memo } from "react";
import { useNovelCard } from "./useNovelCard";
import NovelCardUI from "./NovelCardUI";
import type { Book } from "@/types/book";

/**
 * NovelCardProps 接口定义了 NovelCard 组件所需的属性
 * @interface NovelCardProps
 * @property {Book} book - 书籍对象，包含书名、封面、字数、更新时间和作者等信息
 * @property {function} [onCardClick] - 可选的点击事件处理函数
 */
interface NovelCardProps {
    book: Book;
    onCardClick?: (book: Book) => void;
}

/**
 * NovelCard 组件 - 小说卡片主组件，组合了业务逻辑和UI渲染
 * @param {NovelCardProps} props - 组件属性
 * @returns {JSX.Element} 小说卡片组件
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useNovelCard hook 中，UI 渲染由 NovelCardUI 组件负责。
 */
const NovelCard: React.FC<NovelCardProps> = ({ book, onCardClick }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("NovelCard (with Col wrapper) render for:", book.id);
    }

    // 使用自定义hook获取业务逻辑
    const {
        formatBookWordCount,
        formatBookUpdateTime,
        getBookStatusText,
        handleCardClick
    } = useNovelCard();

    return (
        <NovelCardUI
            book={book}
            onCardClick={() => handleCardClick(book, onCardClick)}
            formatBookWordCount={formatBookWordCount}
            formatBookUpdateTime={formatBookUpdateTime}
            getBookStatusText={getBookStatusText}
        />
    );
};

NovelCard.displayName = "NovelCard";

export default memo(NovelCard);
