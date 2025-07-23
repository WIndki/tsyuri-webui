;
import React from "react";
import { Card, Space, Tooltip, Col } from "antd";
import {
    FileTextOutlined,
    ClockCircleOutlined,
    UserOutlined,
} from "@ant-design/icons";
import type { Book } from "@/types/book";
import styles from "./styles.module.css";
import NovelCover from "./NovelCover/index";
import NovelMeta from "./NovelMeta/index";
// import { formatWordCount, formatUpdateTime } from "./utils";

interface NovelCardUIProps {
    book: Book;
    onCardClick?: (book: Book) => void;
    formatBookWordCount: (wordCount: string) => string;
    formatBookUpdateTime: (time: string) => string;
    getBookStatusText: (bookStatus: string) => string;
}

/**
 * NovelCardUI 组件 - 专门负责小说卡片的UI渲染
 * @param props NovelCardUIProps
 * @returns JSX.Element
 */
const NovelCardUI: React.FC<NovelCardUIProps> = ({ 
    book, 
    onCardClick,
    formatBookWordCount,
    formatBookUpdateTime,
    // getBookStatusText
}) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("NovelCardUI (with Col wrapper) render for:", book.id);
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
                classNames={{
                    cover: styles.coverContainer,
                }}
                actions={[
                    <Tooltip
                        key="wordCount"
                        title={"字数：" + formatBookWordCount(book.wordCount)}
                    >
                        <Space>
                            <FileTextOutlined />
                            <span>{formatBookWordCount(book.wordCount)}</span>
                        </Space>
                    </Tooltip>,
                    <Tooltip
                        key="updateTime"
                        title={"最后更新于：" + book.lastIndexUpdateTime}
                    >
                        <Space>
                            <ClockCircleOutlined />
                            <span>
                                {formatBookUpdateTime(book.lastIndexUpdateTime)}
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

NovelCardUI.displayName = "NovelCardUI";

export default React.memo(NovelCardUI);
