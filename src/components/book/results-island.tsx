"use client";

import { useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import { Alert, Button, Pagination } from "antd";

import { BookCard } from "@/components/book/book-card";
import type { Book, BookPage } from "@/lib/api/book";
import { loadBookPage } from "@/lib/server/book-actions";
import { toSearchParams, type SearchQuery } from "@/lib/search/query";

import { InfiniteTail } from "./infinite-tail";
import styles from "./results.module.css";

interface ResultsIslandProps {
    /** The page the server rendered for the current URL. */
    initialPage: BookPage;
    query: SearchQuery;
    /** Request time in epoch milliseconds, pinned on the server. */
    now: number;
    /** Canonical URL of the current result view, carried into every detail link. */
    fromHref: string;
}

/**
 * The result list.
 *
 * Renders the server-rendered page immediately, then adds behaviour on top. The mode comes from
 * `query.display`, so it is known during the server render and the books are in the initial HTML.
 *
 * Reading the mode from `localStorage` instead would make it unknowable on the server, and the
 * earlier version of this component returned `null` while waiting for the client to resolve it —
 * which meant the search page shipped no results at all and the list only appeared after hydration.
 *
 * The two modes disagree about what the list *is*, so they are separate components:
 *
 * - Pagination shows a window onto the result set. The URL owns it, and `page.items` is the only
 *   correct source for the visible books.
 * - Infinite scroll shows an accumulation. The client owns the appended pages, and the server render
 *   contributes the first one.
 *
 * Keying the subtree on the canonical query string keeps the accumulation honest: a filter change
 * produces a new key, React unmounts the old subtree, and no stale page can survive. Deriving the key
 * from `toSearchParams` means a newly added filter cannot be forgotten here.
 */
export function ResultsIsland({ initialPage, query, now, fromHref }: ResultsIslandProps) {
    const queryKey = toSearchParams(query).toString();

    if (query.display === "pagination") {
        return <PaginatedResults key={queryKey} page={initialPage} now={now} fromHref={fromHref} />;
    }

    return (
        <InfiniteResults
            key={queryKey}
            initialPage={initialPage}
            query={query}
            now={now}
            fromHref={fromHref}
        />
    );
}

/* ────────────────────────────── pagination mode ────────────────────────────── */

interface PaginatedResultsProps {
    page: BookPage;
    now: number;
    fromHref: string;
}

/**
 * One page of results, replaced wholesale on navigation.
 *
 * Renders `page.items` directly instead of holding them in state: the page number lives in the
 * URL, the server renders the matching items, and copying them into a `useState` only creates a
 * second copy that can fall behind the first.
 */
function PaginatedResults({ page, now, fromHref }: PaginatedResultsProps) {
    const router = useRouter();

    const goToPage = useCallback(
        (next: number) => {
            const url = new URL(window.location.href);
            url.searchParams.set("curr", String(next));
            /*
             * A router navigation rather than `window.location.assign`: it keeps the App Router
             * informed, so the prefetched payload and the client cache are reused and the scroll
             * position is restored by the framework rather than by a full document load.
             */
            router.push(`${url.pathname}${url.search}`, { scroll: true });
        },
        [router],
    );

    return (
        <section aria-label="搜索结果">
            <div className={styles.grid}>
                {page.items.map((book, index) => (
                    <BookCard
                        key={book.id}
                        book={book}
                        now={now}
                        from={fromHref}
                        priority={index < 4}
                    />
                ))}
            </div>

            <div className={styles.pager}>
                <Pagination
                    current={page.page}
                    pageSize={page.pageSize}
                    total={page.total}
                    showSizeChanger={false}
                    // `total` is an upstream estimate that is demonstrably wrong for filtered
                    // queries, so quick-jump is offered only when the pager is clearly useful.
                    showQuickJumper={page.total > page.pageSize * 20}
                    hideOnSinglePage
                    onChange={goToPage}
                />
            </div>
        </section>
    );
}

/* ──────────────────────────── infinite scroll mode ─────────────────────────── */

interface InfiniteResultsProps {
    initialPage: BookPage;
    query: SearchQuery;
    now: number;
    fromHref: string;
}

/**
 * An accumulation of pages, appended as the sentinel comes into view.
 *
 * Every appended page is fetched through the `loadBookPage` Server Action, so the browser never
 * contacts the upstream index, the server data cache is reused, and the depth is mirrored into
 * the URL with `replaceState` purely so a reload or a share keeps the visitor's place.
 *
 * `hasMore` is tracked as state rather than read back from the initial page. Reading it from
 * `initialPage` was wrong: after appending page 2, `initialPage` still described page 1, so the
 * sentinel reported "no more" and scrolling stopped one page in.
 */
function InfiniteResults({ initialPage, query, now, fromHref }: InfiniteResultsProps) {
    const [books, setBooks] = useState<Book[]>(initialPage.items);
    const [loadedPage, setLoadedPage] = useState(initialPage.page);
    const [hasMore, setHasMore] = useState(initialPage.hasMore);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<{ message: string; retryable: boolean } | null>(null);

    const loadNext = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        setError(null);

        const next = loadedPage + 1;
        const result = await loadBookPage(query, next);

        if (result.ok) {
            setBooks((previous) => {
                const seen = new Set(previous.map((book) => book.id));
                return [...previous, ...result.page.items.filter((book) => !seen.has(book.id))];
            });
            setLoadedPage(next);
            setHasMore(result.page.hasMore);

            // Mirror the depth into the URL without navigating: the visitor did not ask to go
            // anywhere, so a history entry would be wrong, but a reload or a share should land
            // near where they stopped.
            const url = new URL(window.location.href);
            url.searchParams.set("curr", String(next));
            window.history.replaceState(null, "", url);
        } else {
            setError({ message: result.message, retryable: result.retryable });
        }

        setIsLoading(false);
    }, [isLoading, hasMore, loadedPage, query]);

    return (
        <section aria-label="搜索结果">
            <div className={styles.grid}>
                {books.map((book, index) => (
                    <BookCard
                        key={book.id}
                        book={book}
                        now={now}
                        from={fromHref}
                        priority={index < 4}
                    />
                ))}
            </div>

            {error ? (
                <Alert
                    type="warning"
                    showIcon
                    style={{ marginTop: 16 }}
                    message={error.message}
                    action={
                        error.retryable ? (
                            <Button size="small" onClick={loadNext}>
                                重试
                            </Button>
                        ) : null
                    }
                />
            ) : null}

            <InfiniteTail
                hasMore={hasMore}
                isLoading={isLoading}
                onLoadMore={loadNext}
            />
        </section>
    );
}
