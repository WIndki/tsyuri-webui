import React from "react";
import { Typography, Tag, Space, Row, Col, Card } from "antd";
import type { Book } from "@/types/book";

const { Text, Paragraph } = Typography;
const { Meta } = Card;

interface NovelMetaUIProps {
    book: Book;
    getStatusTag: (bookStatus: string) => { color: string; text: string } | null;
    renderTags: (tagString: string, purity?: string) => { tags: string[]; purity?: string };
}

/**
 * NovelMetaUI 组件 - 专门负责书籍元数据的UI渲染
 * @param props NovelMetaUIProps
 * @returns JSX.Element
 */
const NovelMetaUI: React.FC<NovelMetaUIProps> = ({ 
    book,
    getStatusTag,
    renderTags
}) => {
    // 根据状态返回对应的文本和颜色
    const statusTag = getStatusTag(book.bookStatus);

    // 处理标签显示
    const { tags, purity } = renderTags(book.tag, book.purity);

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
                        <Col>
                            {statusTag && (
                                <Tag color={statusTag.color}>
                                    {statusTag.text}
                                </Tag>
                            )}
                        </Col>
                    </Row>
                    <div>
                        <Space size={[0, 4]} wrap>
                            {tags.map((tag) => (
                                <Tag key={tag} color="blue" style={{ marginRight: 4 }}>
                                    {tag}
                                </Tag>
                            ))}
                            {purity && (
                                <Tag color="green" style={{ marginRight: 4 }}>
                                    {purity}
                                </Tag>
                            )}
                        </Space>
                    </div>
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

NovelMetaUI.displayName = "NovelMetaUI";

export default React.memo(NovelMetaUI);
