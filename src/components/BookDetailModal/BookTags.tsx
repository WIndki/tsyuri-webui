import React from "react";
import { Modal, Space, Tag, Tooltip } from "antd";
import Debounce from "@/utils/Debounce";
import { useAppDispatch } from "@/redux/hooks";
import {
    resetBooks,
    searchBooks,
    setSearchParams,
    setUrlParams,
} from "@/redux/slices/booksSlice";

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
    const dispatch = useAppDispatch();
    // 格式化标签显示
    const renderTags = (tagString: string) => {
        if (!tagString) return [];
        return tagString.split(",").filter((tag) => tag.trim());
    };

    const debounceHandleTagClick = Debounce(
        (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            event.stopPropagation();
            const targetElement = event.target as HTMLElement;
            const clickedTagElement = targetElement.closest(".novel-tag");
            if (clickedTagElement instanceof HTMLElement) {
                const tagName = (clickedTagElement.textContent || "").trim();
                if (tagName) {
                    dispatch(resetBooks()); // 重置书籍列表
                    const newParams = {
                        // ...searchParams,
                        tag: tagName, // 设置新的标签过滤条件
                        curr: 1, // 重置当前页码
                        limit: 20, // 每页显示20本书
                    };
                    dispatch(setSearchParams(newParams)); // 设置新的搜索参数
                    dispatch(setUrlParams()); // 更新 URL 参数
                    dispatch(searchBooks(newParams)); // 执行搜索操作
                    Modal.destroyAll(); // 关闭所有模态框
                }
            }
        },
        1000,
        true
    );

    return (
        <Space
            size={[0, 8]}
            wrap
            onClick={(e) => {
                debounceHandleTagClick(e);
            }}
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

export default BookTags;
