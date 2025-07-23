import React from "react";
import { useNovelMeta } from "./useNovelMeta";
import NovelMetaUI from "./NovelMetaUI";
import type { Book } from "@/types/book";

interface NovelMetaProps {
    book: Book;
}

/**
 * NovelMeta 组件 - 书籍元数据主组件，组合了业务逻辑和UI渲染
 * @param props NovelMetaProps
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useNovelMeta hook 中，UI 渲染由 NovelMetaUI 组件负责。
 */
const NovelMeta: React.FC<NovelMetaProps> = ({ book }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("NovelMeta render");
    }

    // 使用自定义hook获取业务逻辑
    const { getStatusTag, renderTags } = useNovelMeta();

    return (
        <NovelMetaUI
            book={book}
            getStatusTag={getStatusTag}
            renderTags={renderTags}
        />
    );
};

NovelMeta.displayName = "NovelMeta";

export default React.memo(NovelMeta);
