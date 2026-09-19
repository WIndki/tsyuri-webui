import { BookCover } from "@/components/book/book-cover";
import { BookMetaList } from "@/components/book/book-meta-list";
import { BookTags } from "@/components/book/book-tags";
import type { Book } from "@/lib/api/book";

import styles from "./book-detail-view.module.css";

interface BookDetailViewProps {
    book: Book;
    /** Request time in epoch milliseconds, so the relative update label is stable. */
    now: number;
    /**
     * Optional control rendered above the record.
     *
     * The full page puts a back link here; the modal does not need one, because closing it returns to the list
     * still visible behind it.
     */
    leading?: React.ReactNode;
}

/**
 * The detail of a book, as it appears both on its own page and in the modal.
 *
 * A Server Component. One component for both presentations is what keeps them from drifting: two copies of this
 * markup would diverge, and the difference would only show in whichever was edited second.
 *
 * The layout is a cover beside a list of facts, then the description in its own panel. That order follows how a
 * record is read — what it looks like, then what it is, then what it is about.
 */
export function BookDetailView({ book, now, leading }: BookDetailViewProps) {
    return (
        <article className={styles.view}>
            {leading}

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
