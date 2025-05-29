import React from "react";
import { Space, Tag } from "antd";

/**
 * BookTagsProps 接口定义了书籍标签组件所需的属性
 * @interface BookTagsProps
 * @property {string} tag - 书籍的标签字符串，多个标签用逗号分隔
 * @property {string} [purity] - 书籍的纯度分类，可选
 */
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
