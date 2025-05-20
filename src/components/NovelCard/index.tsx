"use client";
import React, { memo, useState } from "react";
import { Card, Typography, Tag, Space, Tooltip, Row, Col } from "antd";
import {
    FileTextOutlined,
    ClockCircleOutlined,
    UserOutlined,
} from "@ant-design/icons";
import type { Book } from "../../types/book";
import BookDetailModal from "../BookDetailModal";

const { Text, Paragraph } = Typography;
const { Meta } = Card;

interface BookCardProps {
    book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
    const [showDetailModal, setShowDetailModal] = useState(false);

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

    const handleCardClick = () => {
        setShowDetailModal(true);
    };

    const handleCloseModal = () => {
        setShowDetailModal(false);
    };

    return (
        <>
            <Card
                hoverable
                style={{ width: "100%", borderRadius: 8 }}
                cover={
                    <div
                        style={{
                            height: 200,
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <img
                            alt={book.bookName}
                            src={book.picUrl}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.3s ease",
                            }}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src =
                                    "/images/book-placeholder.jpg"; // 替换为默认图片路径
                            }}
                        />
                        <div
                            style={{
                                position: "absolute",
                                bottom: 0,
                                width: "100%",
                                background:
                                    "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                                padding: "20px 10px 10px 10px",
                            }}
                        >
                            <Text
                                style={{
                                    color: "white",
                                    fontSize: 16,
                                    fontWeight: "bold",
                                }}
                                ellipsis
                            >
                                {book.bookName}
                            </Text>
                        </div>
                    </div>
                }
                onClick={handleCardClick}
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
            <BookDetailModal
                book={book}
                visible={showDetailModal}
                onClose={handleCloseModal}
            />
        </>
    );
};

export default memo(BookCard);
