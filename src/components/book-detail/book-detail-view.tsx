import { BookCover } from "@/components/book/book-cover";
import { BookMetaList } from "@/components/book/book-meta-list";
import { BookTags } from "@/components/book/book-tags";
import { BookActions } from "@/components/book-detail/book-actions";
import type { Book } from "@/lib/api/book";

import styles from "./book-detail-view.module.css";

interface BookDetailViewProps {
    book: Book;
    /** Request time in epoch milliseconds, so the relative update label is stable. */
    now: number;
}

/**
 * The detail of a book.
 *
 * A Server Component, so the record is in the HTML rather than fetched after the dialog opens. The dialog around it is
 * supplied by the intercepted route.
 *
 * The layout is a cover beside a list of facts, then the description in its own panel. That order follows how a record
 * is read — what it looks like, then what it is, then what it is about.
 */
export function BookDetailView({ book, now }: BookDetailViewProps) {
    return (
        <article className={styles.view}>
            <div className={styles.layout}>
                <div className={styles.coverColumn}>
                    <BookCover
                        src={book.coverUrl}
                        alt={`${book.title} 封面`}
                        sizes="(max-width: 768px) 60vw, 240px"
                        priority
                    />
                </div>

                <div className={styles.infoColumn}>
                    <h1 className={styles.title}>{book.title}</h1>
                    <p className={styles.author}>{book.author}</p>

                    <BookTags
                        tags={book.tags}
                        purityLabel={book.purityLabel}
                        status={book.status}
                        source={book.source}
                    />

                    <BookMetaList book={book} now={now} />

                    <BookActions title={book.title} />
                </div>
            </div>

            <section className={styles.descriptionSection}>
                <h2 className={styles.sectionHeading}>简介</h2>
                {book.description ? (
                    <p className={styles.description}>{book.description}</p>
                ) : (
                    <p className={styles.empty}>暂无简介</p>
                )}
            </section>

            <p className={styles.footer}>
                本站不提供正文，仅聚合检索公开书目信息。数据与封面版权归原作者及来源平台所有。
            </p>
        </article>
    );
}
