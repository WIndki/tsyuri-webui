import { Space, Tag } from "antd";

interface BookTagsProps {
    tags: string[];
    purityLabel: string | null;
    status: string;
    source: string;
}

/**
 * A book's classification, as one wrapping row.
 *
 * A Server Component, which is why antd's `Space` and `Tag` are used directly rather than through any compound form:
 * antd's exports reach a Server Component as client references carrying no custom statics.
 *
 * `Space` rather than a styled container, so the distance between tags comes from the theme's spacing scale and
 * matches every other group of controls in the interface.
 *
 * The status and purity tags carry colour because they are the two attributes a reader scans for. Source and topic tags
 * stay neutral so the coloured ones keep their meaning.
 */
export function BookTags({ tags, purityLabel, status, source }: BookTagsProps) {
    return (
        <Space size={[4, 6]} wrap>
            <Tag color={status === "1" ? "green" : "blue"}>{status === "1" ? "已完结" : "连载中"}</Tag>

            {purityLabel ? <Tag color="gold">纯度 {purityLabel}</Tag> : null}

            <Tag>{source}</Tag>

            {tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
            ))}
        </Space>
    );
}
