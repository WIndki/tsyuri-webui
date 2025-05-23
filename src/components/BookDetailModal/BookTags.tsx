import React from "react";
import { Space, Tag } from "antd";

interface BookTagsProps {
    tag: string;
    purity?: string;
}

const BookTags: React.FC<BookTagsProps> = ({ tag, purity }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("BookTags render");
    }
    // 格式化标签显示
    const renderTags = (tagString: string) => {
        if (!tagString) return [];
        return tagString.split(",").filter((tag) => tag.trim());
    };

    return (
        <Space size={[0, 8]} wrap>
            {renderTags(tag).map((tagItem) => (
                <Tag key={tagItem} color="blue">
                    {tagItem}
                </Tag>
            ))}
            {purity && <Tag color="green">{purity}</Tag>}
        </Space>
    );
};

export default BookTags;
