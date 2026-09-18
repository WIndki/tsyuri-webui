import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BookCover } from "@/components/book/book-cover";
import { BookMetaList } from "@/components/book/book-meta-list";
import { BookTags } from "@/components/book/book-tags";
import { BackLink } from "@/components/search/back-link";
import { getBookById } from "@/lib/server/book-detail";
import { requestTimestamp } from "@/lib/server/request-timestamp";

import styles from "./page.module.css";

/**
 * Book detail.
 *
 * A Server Component, so the whole record is in the HTML and the page needs no client-side fetch.
 * That is what makes it worth having as its own route rather than a panel over the list: it is
 * linkable, shareable, back-button friendly, and indexable by search engines.
 *
 * ## Why the URL carries the title
 *
 * Upstream has no detail endpoint, so the record has to be found by searching its name. The title
 * therefore travels in the query string to make the lookup possible, while the `id` stays in the
 * path so the canonical URL is stable and the result can be verified. `getBookById` requires the
 * returned record to carry the requested `id`, so a stale or edited title degrades to a 404 rather
 * than silently showing a different book.
 *
 * `?from=` carries the search URL the visitor arrived from, so "back to results" returns them to
 * their filters instead of dropping them at an empty search page.
 */

interface BookDetailPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Ids are numeric strings upstream; anything else cannot resolve. */
const ID_PATTERN = /^\d+$/;

const MAX_TITLE_LENGTH = 200;

function readParam(
    source: Record<string, string | string[] | undefined>,
    key: string,
): string | undefined {
    const value = source[key];
    if (Array.isArray(value)) return value.at(-1);
    return value;
}

export async function generateMetadata({
    params,
    searchParams,
}: BookDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    const title = readParam(await searchParams, "title");

    if (!ID_PATTERN.test(id) || !title) return { title: "书籍详情" };

    return {
        title,
        description: `${title} 的详细信息与标签`,
        alternates: { canonical: `/book/${id}` },
    };
}

export default async function BookDetailPage({ params, searchParams }: BookDetailPageProps) {
    const { id } = await params;
    const raw = await searchParams;

    const title = (readParam(raw, "title") ?? "").trim().slice(0, MAX_TITLE_LENGTH);
    const from = readParam(raw, "from");

    if (!ID_PATTERN.test(id) || !title) notFound();

    // Pinned once per request so the relative update label is identical on the server render and
    // after hydration.
    const now = requestTimestamp();

    let book;
    try {
        book = await getBookById(id, title);
    } catch (error) {
        console.error("[book-detail] lookup failed", { id, title, error });
        throw error;
    }

    if (!book) notFound();

    // Only accept a `from` that points back into this app, so the link cannot be used to bounce a
    // visitor to an arbitrary origin.
    const backHref = from && from.startsWith("/search") ? from : "/search";

    return (
        <article className={styles.page}>
            <BackLink href={backHref} />

            <div className={styles.layout}>
                <div className={styles.coverColumn}>
                    <BookCover
                        src={book.coverUrl}
                        alt={`${book.title} 封面`}
                        sizes="(max-width: 768px) 60vw, 260px"
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

            <footer className={styles.footer}>
                <p>
                    本站不提供正文，仅聚合检索公开书目信息。数据与封面版权归原作者及来源平台所有。
                </p>
            </footer>
        </article>
    );
}
