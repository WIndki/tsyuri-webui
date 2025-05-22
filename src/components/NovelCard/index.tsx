"use client";
import React, { memo } from "react";
import { Card, Typography, Tag, Space, Tooltip, Row, Col } from "antd";
import {
    FileTextOutlined,
    ClockCircleOutlined,
    UserOutlined,
} from "@ant-design/icons";
import type { Book } from "../../types/book";
import "./novelCard.css";

const { Text, Paragraph } = Typography;
const { Meta } = Card;

interface BookCardProps {
    book: Book;
    onCardClick?: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onCardClick }) => {
    // 格式化字数显示
    const formatWordCount = (wordCount: string) => {
        const count = parseInt(wordCount);
        if (count >= 10000) {
            return `${(count / 10000).toFixed(1)}万字`;
        }
        return `${count}字`;
    };

    // 格式化更新时间
    const formatUpdateTime = (time: string) => {
        const updateDate = new Date(time);
        const now = new Date();
        const diffDays = Math.floor(
            (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) {
            return "今天";
        } else if (diffDays === 1) {
            return "昨天";
        } else if (diffDays < 30) {
            return `${diffDays}天前`;
        } else {
            return updateDate.toLocaleDateString();
        }
    };

    // 根据状态返回对应的文本和颜色
    const getStatusTag = () => {
        if (book.bookStatus === "0") {
            return <Tag color="processing">连载中</Tag>;
        } else if (book.bookStatus === "1") {
            return <Tag color="success">已完结</Tag>;
        }
        return null;
    };

    // 处理标签显示
    const renderTags = (tagString: string) => {
        if (!tagString) return null;

        const tags = tagString.split(",").filter((tag) => tag.trim());
        return (
            <Space size={[0, 4]} wrap>
                {tags.map((tag) => (
                    <Tag key={tag} color="blue" style={{ marginRight: 4 }}>
                        {tag}
                    </Tag>
                ))}
                {book.purity && (
                    <Tag color="green" style={{ marginRight: 4 }}>
                        {book.purity}
                    </Tag>
                )}
            </Space>
        );
    };

    // 处理卡片点击
    const handleCardClick = () => {
        if (onCardClick) {
            onCardClick(book);
        }
    };

    return (
        <>
            <Card
                hoverable
                className="novel-card"
                onClick={handleCardClick}
                cover={
                    <div className="novel-card-cover">
                        <img
                            alt={book.bookName}
                            src={book.picUrl}
                            className="novel-card-image"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                    "/images/book-placeholder.jpg";
                            }}
                        />
                        <div className="novel-card-title-overlay">
                            <Text className="novel-card-title" ellipsis>
                                {book.bookName}
                            </Text>
                        </div>
                    </div>
                }
                actions={[
                    <Tooltip
                        key={book.id}
                        title={"字数：" + formatWordCount(book.wordCount)}
                    >
                        <Space>
                            <FileTextOutlined />
                            <span>{formatWordCount(book.wordCount)}</span>
                        </Space>
                    </Tooltip>,
                    <Tooltip
                        key={book.id}
                        title={"最后更新于：" + book.lastIndexUpdateTime}
                    >
                        <Space>
                            <ClockCircleOutlined />
                            <span>
                                {formatUpdateTime(book.lastIndexUpdateTime)}
                            </span>
                        </Space>
                    </Tooltip>,
                    <Tooltip key={book.id} title={"作者：" + book.authorName}>
                        <Space>
                            <UserOutlined />
                            <span>{book.authorName}</span>
                        </Space>
                    </Tooltip>,
                ]}
            >
                <Meta
                    title={book.bookName}
                    description={
                        <Space
                            direction="vertical"
                            style={{ width: "100%" }}
                            size="small"
                        >
                            <Row gutter={8} align="middle">
                                <Col>
                                    <Text type="secondary">
                                        来源: {book.crawlSourceName}
                                    </Text>
                                </Col>
                                <Col>{getStatusTag()}</Col>
                            </Row>
                            <div>{renderTags(book.tag)} </div>
                            <Paragraph
                                ellipsis={{ rows: 3 }}
                                style={{ marginTop: 8, marginBottom: 0 }}
                            >
                                {book.bookDesc}
                            </Paragraph>
                        </Space>
                    }
                />
            </Card>
        </>
    );
};

export default memo(BookCard);
