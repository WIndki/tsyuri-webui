import { Tag } from "antd";

import styles from "./book-tags.module.css";

interface BookTagsProps {
    tags: string[];
    purityLabel: string | null;
    status: string;
    source: string;
}

/**
 * A book's classification, as one wrapping row.
 *
 * A Server Component, so it uses only antd's top-level `Tag` export. The status and purity tags
 * carry colour because they are the two attributes a reader scans for; source and topic tags stay
 * neutral so the coloured ones keep their meaning.
 */
export function BookTags({ tags, purityLabel, status, source }: BookTagsProps) {
    return (
        <div className={styles.row}>
            <Tag color={status === "1" ? "green" : "blue"} className={styles.tag}>
                {status === "1" ? "已完结" : "连载中"}
            </Tag>

            {purityLabel ? (
                <Tag color="gold" className={styles.tag}>
                    纯度 {purityLabel}
                </Tag>
            ) : null}

            <Tag className={styles.tag}>{source}</Tag>

            {tags.map((tag) => (
                <Tag key={tag} className={styles.tag}>
                    {tag}
                </Tag>
            ))}
        </div>
    );
}
