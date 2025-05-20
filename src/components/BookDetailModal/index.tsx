import React, { useContext } from "react";
import {
    Modal,
    Typography,
    Descriptions,
    Tag,
    Divider,
    Image,
    Space,
    Button,
} from "antd";
import type { Book } from "@/types/book";
import { NotificationContext } from "../Main";

const { Title, Paragraph } = Typography;

interface BookDetailModalProps {
    book: Book;
    visible: boolean;
    onClose: () => void;
}

const BookDetailModal: React.FC<BookDetailModalProps> = ({
    book,
    visible,
    onClose,
}) => {
    const { api: notificationApi } = useContext(NotificationContext);

    // 格式化标签显示
    const renderTags = (tagString: string) => {
        if (!tagString) return [];
        return tagString.split(",").filter((tag) => tag.trim());
    };

    // 获取状态文本
    const getStatusText = () => {
        if (book.bookStatus === "0") {
            return "连载中";
        } else if (book.bookStatus === "1") {
            return "已完结";
        }
        return "未知";
    };

    // 格式化字数显示
    const formatWordCount = (wordCount: string) => {
        const count = parseInt(wordCount);
        if (count >= 10000) {
            return `${(count / 10000).toFixed(1)}万字`;
        }
        return `${count}字`;
    };

    return (
        <Modal
            title="小说详情"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            destroyOnClose={true}
            destroyOnHidden={true}
            centered={true}
            // 添加自定义样式类
            className="glass-modal"
            // 自定义Modal样式
            styles={{
                mask: {
                    backdropFilter: "blur(8px)",
                    background: "rgba(0, 0, 0, 0.5)",
                },
                content: {
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                },
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "20px",
                    marginBottom: "20px",
                }}
            >
                <Image
                    style={{ borderRadius: "8px", alignItems: "center" }}
                    width={200}
                    src={book.picUrl}
                    alt={book.bookName}
                    fallback="/images/book-placeholder.jpg"
                    placeholder={
                        <div
                            style={{
                                width: 200,
                                height: 300,
                                background: "#f0f0f0",
                            }}
                        ></div>
                    }
                />
                <div style={{ flex: 1, minWidth: "300px" }}>
                    <Title level={3}>{book.bookName}</Title>
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="作者">
                            {book.authorName}
                        </Descriptions.Item>
                        <Descriptions.Item label="字数">
                            {formatWordCount(book.wordCount)}
                        </Descriptions.Item>
                        <Descriptions.Item label="状态">
                            {getStatusText()}
                        </Descriptions.Item>
                        <Descriptions.Item label="来源">
                            {book.crawlSourceName}
                        </Descriptions.Item>
                        <Descriptions.Item label="最后更新">
                            {new Date(
                                book.lastIndexUpdateTime
                            ).toLocaleString()}
                        </Descriptions.Item>
                    </Descriptions>
                    <Space size={8} style={{ marginTop: "16px" }}>
                        <Button
                            type="primary"
                            onClick={() => {
                                navigator.clipboard.writeText(book.bookName);
                                notificationApi?.success({
                                    message: "复制成功",
                                    description: `已将 "${book.bookName}" 复制到剪贴板`,
                                    placement: "topRight",
                                    duration: 3,
                                });
                            }}
                        >
                            复制名称
                        </Button>
                    </Space>
                </div>
            </div>
            <Divider orientation="left">简介</Divider>
            <Paragraph>{book.bookDesc}</Paragraph>

            <Divider orientation="left">标签</Divider>
            <Space size={[0, 8]} wrap>
                {renderTags(book.tag).map((tag) => (
                    <Tag key={tag} color="blue">
                        {tag}
                    </Tag>
                ))}
                {book.purity && <Tag color="green">{book.purity}</Tag>}
            </Space>
        </Modal>
    );
};

export default BookDetailModal;
