import Link from "next/link";

import { BookCover } from "@/components/book/book-cover";
import { BookMetaInline } from "@/components/book/book-meta-list";
import { LinkPendingHint } from "@/components/book/link-pending-hint";
import type { Book } from "@/lib/api/book";
import { truncate } from "@/lib/format";
import { toBookHref } from "@/lib/search/query";

import styles from "./book-card.module.css";

interface BookCardProps {
    book: Book;
    /** Request time in epoch milliseconds, pinned on the server. */
    now: number;
    /**
     * The search URL this card was rendered on.
     *
     * Carried into the detail link so the detail page can offer a return that restores the
     * visitor's filters and page.
     */
    from: string;
    /** Set on the first row so the browser fetches those covers eagerly. */
    priority?: boolean;
    /**
     * Play the entrance animation.
     *
     * Set for cards that appear as a result of a visitor action — a filter change, a new page,
     * appended infinite-scroll pages — so the appearance is legible as a change. Left off for the
     * first server-rendered page, which is already painted when the island hydrates; replaying the
     * animation there would read as a flicker on load.
     */
    animate?: boolean;
}

/**
 * A single result card.
 *
 * A Server Component — no state, no effects, no event handlers — so a page of results ships no
 * JavaScript for the cards themselves.
 *
 * The whole surface opens the book, through one stretched link rather than a click handler: the
 * link's `::after` covers the card, so a click anywhere lands on it. That is what makes a result
 * openable in a new tab, middle-clickable, copyable as a URL, and reachable by keyboard, none of
 * which worked when the card was a `div` carrying an `onClick`.
 *
 * The cover is decorative (`alt=""`) because the title directly below it is the accessible name for
 * the same destination; announcing the title twice would be noise.
 */
export function BookCard({ book, now, from, priority = false, animate = false }: BookCardProps) {
    const href = toBookHref(book, from);

    return (
        <article className={animate ? `${styles.card} ${styles.enter}` : styles.card}>
            <BookCover
                src={book.coverUrl}
                alt=""
                sizes="(max-width: 576px) 45vw, (max-width: 992px) 22vw, 190px"
                priority={priority}
            />

            <div className={styles.body}>
                <h3 className={styles.title}>
                    {/*
                     * `prefetch={false}` because the default prefetches every link that scrolls into view, and each of
                     * these costs a full upstream search. A page of results is 24 links, so scrolling the grid issued
                     * dozens of lookups for records most visitors never open. The results island prefetches the first
                     * few instead.
                     */}
                    <Link href={href} className={styles.link} title={book.title} prefetch={false}>
                        {truncate(book.title, 44)}
                        {/*
                         * Reads the pending state of this link. It has to be a child of the `Link`, which
                         * is why it is passed as children rather than rendered beside the card.
                         */}
                        <LinkPendingHint />
                    </Link>
                </h3>

                <p className={styles.author} title={book.author}>
                    {book.author}
                </p>

                <div className={styles.tags}>
                    <span className={book.status === "1" ? styles.done : styles.ongoing}>
                        {book.status === "1" ? "完结" : "连载"}
                    </span>
                    {book.purityLabel ? (
                        <span className={styles.purity}>{book.purityLabel}</span>
                    ) : null}
                    {book.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className={styles.tag}>
                            {tag}
                        </span>
                    ))}
                </div>

                <p className={styles.summary}>{book.description || "暂无简介"}</p>

                <div className={styles.footer}>
                    <BookMetaInline book={book} now={now} />
                    <span className={styles.source}>{book.source}</span>
                </div>
            </div>
        </article>
    );
}
