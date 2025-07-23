import React from "react";
import { useNovelCover } from "./useNovelCover";
import NovelCoverUI from "./NovelCoverUI";
import type { Book } from "@/types/book";

interface NovelCoverProps {
    book: Book;
    onCardClick?: () => void;
}

/**
 * NovelCover 组件 - 小说封面主组件，组合了业务逻辑和UI渲染
 * @param props NovelCoverProps
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useNovelCover hook 中，UI 渲染由 NovelCoverUI 组件负责。
 */
const NovelCover: React.FC<NovelCoverProps> = ({ book, onCardClick }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("NovelCover render");
    }

    // 使用自定义hook获取业务逻辑
    const { handleImageError, handleCardClick } = useNovelCover();

    return (
        <NovelCoverUI
            book={book}
            onImageError={handleImageError}
            onCardClick={() => handleCardClick(onCardClick)}
        />
    );
};

NovelCover.displayName = "NovelCover";

export default React.memo(NovelCover);
