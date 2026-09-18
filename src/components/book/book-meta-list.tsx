import type { Book } from "@/lib/api/book";
import {
    formatAbsoluteDate,
    formatRelativeDate,
    formatWordCount,
} from "@/lib/format";

import styles from "./book-meta-list.module.css";

interface BookMetaListProps {
    book: Book;
    /** Request time in epoch milliseconds, pinned on the server. */
    now: number;
}

/**
 * The factual attributes of a book, as a definition list.
 *
 * A Server Component built from semantic HTML. `dl`/`dt`/`dd` is the correct structure for
 * label-value pairs, and it gives assistive technology the association between each label and its
 * value, which a grid of styled `div`s does not.
 *
 * Fields upstream never populates (score, visit count, comment count) are omitted rather than
 * rendered as "—". A row of permanently empty labels reads as a broken page.
 */
export function BookMetaList({ book, now }: BookMetaListProps) {
    const rows: { label: string; value: string; title?: string }[] = [
        { label: "字数", value: formatWordCount(book.wordCount) },
        {
            label: "最后更新",
            value: formatRelativeDate(book.updatedAtMs, now),
            title: formatAbsoluteDate(book.updatedAtMs),
        },
        { label: "来源平台", value: book.source },
    ];

    if (book.category) rows.push({ label: "分类", value: book.category });

    return (
        <dl className={styles.list}>
            {rows.map((row) => (
                <div key={row.label} className={styles.row}>
                    <dt className={styles.label}>{row.label}</dt>
                    <dd className={styles.value} title={row.title || undefined}>
                        {row.value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

/**
 * The same facts for a narrow card, where a definition list would be too tall.
 *
 * Kept beside `BookMetaList` so the two cannot drift apart: both read from the same format
 * helpers, so a change to how a value is presented is made in one file.
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
