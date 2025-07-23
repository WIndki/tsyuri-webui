import React from "react";
import { Space, Tag, Tooltip } from "antd";

interface BookTagsUIProps {
    tag: string;
    purity?: string;
    renderTags: (tagString: string) => string[];
    onTagClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

/**
 * BookTagsUI 组件 - 专门负责书籍标签的UI渲染
 * @param props BookTagsUIProps
 * @returns JSX.Element
 */
const BookTagsUI: React.FC<BookTagsUIProps> = ({ 
    tag, 
    purity,
    renderTags,
    onTagClick
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("BookTagsUI render");
    }

    return (
        <Space
            size={[0, 8]}
            wrap
            onClick={onTagClick}
        >
            {renderTags(tag).map((tagItem, index) => (
                <Tooltip key={index} title={"搜索标签：" + tagItem.trim()}>
                    {/* 使用 Tooltip 包裹 Tag 组件，鼠标悬停时显示提示 */}
                    <Tag
                        key={index}
                        className="novel-tag"
                        color="blue"
                        style={{ cursor: "pointer" }}
                    >
                        {tagItem.trim()}
                    </Tag>
                </Tooltip>
            ))}
            {purity && (
                <Tag color="green" className="purity-tag">
                    {purity}
                </Tag>
            )}
        </Space>
    );
};

export default BookTagsUI;
