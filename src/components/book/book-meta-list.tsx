import { Descriptions } from "antd";

import type { Book } from "@/lib/api/book";
import { formatAbsoluteDate, formatRelativeDate, formatWordCount } from "@/lib/format";

import styles from "./book-meta-list.module.css";

interface BookMetaListProps {
    book: Book;
    /** Request time in epoch milliseconds, pinned on the server. */
    now: number;
}

/**
 * The factual attributes of a book.
 *
 * A Server Component using antd's `Descriptions`. Its parts are given as an `items` array rather than as compound
 * sub-components such as `Descriptions.Item`: a Server Component receives antd's exports as client references that
 * carry no custom statics, so `Descriptions.Item` is unreachable from here while `Descriptions` is not.
 *
 * `column={1}` keeps each fact on its own line, which is what reads well in a panel this narrow. Fields upstream never
 * populates — score, visit count, comment count — are omitted rather than rendered empty, because a row of permanent
 * dashes reads as a broken page.
 */
export function BookMetaList({ book, now }: BookMetaListProps) {
    const items: { key: string; label: string; value: string; title: string }[] = [
        { key: "words", label: "字数", value: formatWordCount(book.wordCount), title: "" },
        {
            key: "updated",
            label: "最后更新",
            value: formatRelativeDate(book.updatedAtMs, now),
            title: formatAbsoluteDate(book.updatedAtMs),
        },
        { key: "source", label: "来源平台", value: book.source, title: "" },
    ];

    if (book.category) {
        items.push({ key: "category", label: "分类", value: book.category, title: "" });
    }

    return (
        <Descriptions
            className={styles.list}
            column={1}
            size="small"
            colon={false}
            items={items.map((item) => ({
                key: item.key,
                label: item.label,
                children: <span title={item.title || undefined}>{item.value}</span>,
            }))}
        />
    );
}

/**
 * The same facts for a narrow card, where a full list would be too tall.
 *
 * Kept beside `BookMetaList` so the two cannot drift apart: both read from the same format helpers, so a change to how
 * a value is presented is made in one place.
 */
export function BookMetaInline({ book, now }: BookMetaListProps) {
    return (
        <div className={styles.inline}>
            <span>{formatWordCount(book.wordCount)}</span>
            <span aria-hidden className={styles.separator}>
                ·
            </span>
            <span title={formatAbsoluteDate(book.updatedAtMs)}>
                {formatRelativeDate(book.updatedAtMs, now)}
            </span>
        </div>
    );
}
