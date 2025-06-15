"use client";
import React, { memo } from "react";
import { Card, Space, Tooltip, Col } from "antd";
import {
    FileTextOutlined,
    ClockCircleOutlined,
    UserOutlined,
} from "@ant-design/icons";
import type { Book } from "../../types/book";
import styles from "./styles.module.css";
import NovelCover from "./NovelCover";
import NovelMeta from "./NovelMeta";
import { formatWordCount, formatUpdateTime } from "./utils";

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

const NovelCard: React.FC<NovelCardProps> = ({ book, onCardClick }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("NovelCard (with Col wrapper) render for:", book.id);
    }
    // 处理卡片点击
    const handleCardClick = () => {
        if (onCardClick) {
            onCardClick(book);
        }
    };

    return (
        <Col span={8} xs={24} sm={12} md={8} lg={6}>
            <Card
                hoverable
                className={styles.novelCard}
                onClick={handleCardClick}
                cover={<NovelCover book={book} />}
                actions={[
                    <Tooltip
                        key="wordCount"
                        title={"字数：" + formatWordCount(book.wordCount)}
                    >
                        <Space>
                            <FileTextOutlined />
                            <span>{formatWordCount(book.wordCount)}</span>
                        </Space>
                    </Tooltip>,
                    <Tooltip
                        key="updateTime"
                        title={"最后更新于：" + book.lastIndexUpdateTime}
                    >
                        <Space>
                            <ClockCircleOutlined />
                            <span>
                                {formatUpdateTime(book.lastIndexUpdateTime)}
                            </span>
                        </Space>
                    </Tooltip>,
                    <Tooltip key="author" title={"作者：" + book.authorName}>
                        <Space>
                            <UserOutlined />
                            <span
                                style={{
                                    wordBreak: "break-all",
                                    wordWrap: "break-word",
                                }}
                            >
                                {book.authorName}
                            </span>
                        </Space>
                    </Tooltip>,
                ]}
            >
                <NovelMeta book={book} />
            </Card>
        </Col>
    );
};
NovelCard.displayName = "NovelCard";

export default memo(NovelCard);
