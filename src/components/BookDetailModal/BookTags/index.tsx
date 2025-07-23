import React from "react";
import { useBookTags } from "./useBookTags";
import BookTagsUI from "./BookTagsUI";

interface BookTagsProps {
    tag: string;
    purity?: string;
}

/**
 * BookTags 组件 - 书籍标签主组件，组合了业务逻辑和UI渲染
 * @param props BookTagsProps
 * @returns JSX.Element
 * @description
 * 该组件将业务逻辑和UI渲染分离，提高了组件的内聚性和可维护性。
 * 业务逻辑封装在 useBookTags hook 中，UI 渲染由 BookTagsUI 组件负责。
 */
const BookTags: React.FC<BookTagsProps> = ({ tag, purity }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("BookTags render");
    }

    // 使用自定义hook获取业务逻辑
    const { renderTags, debounceHandleTagClick } = useBookTags();

    return (
        <BookTagsUI
            tag={tag}
            purity={purity}
            renderTags={renderTags}
            onTagClick={debounceHandleTagClick}
        />
    );
};

export default BookTags;
