import React from "react";
import { Typography, Tag, Space, Row, Col, Card } from "antd";
import type { Book } from "../../types/book";

const { Text, Paragraph } = Typography;
const { Meta } = Card;

/**
 * NovelMetaProps 接口定义了 NovelMeta 组件所需的属性
 * @interface NovelMetaProps
 * @property {Book} book - 书籍对象，包含书名、来源、状态、标签和简介等信息
 */
interface NovelMetaProps {
    book: Book;
}

const NovelMeta: React.FC<NovelMetaProps> = ({ book }) => {
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

    return (
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
    );
};

export default React.memo(NovelMeta);
