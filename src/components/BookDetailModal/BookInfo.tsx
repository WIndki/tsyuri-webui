import React from "react";
import { Typography, Descriptions, Button, Space, App } from "antd";
import type { Book } from "@/types/book";
import styles from "./styles.module.css";

const { Title } = Typography;

/**
 * BookInfoProps 接口定义了书籍信息组件所需的属性
 * @interface BookInfoProps
 * @property {Book} book - 需要显示信息的书籍对象
 */
interface BookInfoProps {
    book: Book;
}

const BookInfo: React.FC<BookInfoProps> = ({ book }) => {
    if (process.env.NEXT_PUBLIC_DEBUG === "true") {
        console.log("BookInfo render");
    }
    const { notification } = App.useApp();

    // 格式化字数显示
    const formatWordCount = (wordCount: string) => {
        const count = parseInt(wordCount);
        if (count >= 10000) {
            return `${(count / 10000).toFixed(1)}万字`;
        }
        return `${count}字`;
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

    return (
        <div className={styles.bookInfo}>
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
                    {new Date(book.lastIndexUpdateTime).toLocaleString()}
                </Descriptions.Item>
            </Descriptions>
            <Space className={styles.actionButtons} size={8}>
                <Button
                    type="primary"
                    onClick={() => {
                        navigator.clipboard.writeText(book.bookName);
                        notification.success({
                            message: "复制成功",
                            description: `已将 "${book.bookName}" 复制到剪贴板`,
                            placement: "topRight",
                            duration: 2,
                        });
                    }}
                >
                    复制名称
                </Button>
                <Button
                    type="primary"
                    onClick={() => {
                        notification.success({
                            message: "即将跳转搜索引擎",
                            description: `将前往搜索引擎搜索 "${book.bookName}"`,
                            placement: "topRight",
                            duration: 2,
                            onClose: () => {
                                const url = `https://www.baidu.com/s?wd=${book.bookName}`;
                                // 判断是否为iOS设备
                                const deviceAgent = navigator.userAgent;
                                const ios = deviceAgent
                                    .toLowerCase()
                                    .match(/(iphone|ipod|ipad|mac|macintosh)/);
                                if (ios) {
                                    // iOS设备使用window.location.href
                                    window.location.href = url;
                                } else {
                                    window.open(url, "_blank");
                                }
                            },
                        });
                    }}
                >
                    搜索该书
                </Button>
            </Space>
        </div>
    );
};

export default BookInfo;
