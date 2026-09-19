"use client";

import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Pagination } from "antd";

import { BookCard } from "@/components/book/book-card";
import { ResultsSkeleton } from "@/components/book/results-skeleton";
import type { Book, BookPage } from "@/lib/api/book";
import { toSearchParams, type SearchQuery } from "@/lib/search/query";
import { useUiStore, setRetryAction } from "@/lib/search/ui-store";
import { loadBookPage } from "@/lib/server/book-actions";

import { InfiniteTail } from "./infinite-tail";
import styles from "./results.module.css";

interface ResultsIslandProps {
    /** The page the server rendered for the current URL. */
    initialPage: BookPage;
    query: SearchQuery;
    /**
     * When the server produced this render, in epoch milliseconds.
     *
     * Used for the relative "updated N days ago" labels, pinned so the server render and the client agree on
     * what "now" is.
     */
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
 * The two modes disagree about what the list *is*, so they are separate components:
 *
 * - Pagination shows a window onto the result set. The URL owns it, and `page.items` is the only correct
 *   source for the visible books.
 * - Infinite scroll shows an accumulation. The client owns the appended pages, and the server render
 *   contributes the first one.
 *
 * Keying the subtree on the canonical query string keeps the accumulation honest: a facet change produces a
 * new key, React unmounts the old subtree, and no stale page can survive. Deriving the key from
 * `toSearchParams` means a newly added facet cannot be forgotten here.
 */
export function ResultsIsland({ initialPage, query, now, fromHref }: ResultsIslandProps) {
    const queryKey = toSearchParams(query).toString();

    const isWaiting = useUiStore((state) => state.isWaiting);
    const expectedCount = useUiStore((state) => state.expectedCount);
    const endWait = useUiStore((state) => state.endWait);

    /*
     * A payload means the wait is over.
     *
     * The island is the component the server render arrives at, so it is the one that can report completion.
     * Nothing needs to be compared: the store only waits while a navigation is outstanding, and while it is
     * outstanding this component has not yet received a payload for the new query. Showing the skeleton is
     * therefore what ends the wait, and `endWait` does nothing when no wait is outstanding.
     */
    /*
     * A payload means the read has produced data.
     *
     * The island is the component the server payload arrives at, so it is the one that can report it. The
     * router also re-renders this component a few milliseconds after the click, from the payload it already
     * had, so the report is not itself proof of a response; `endWait` uses it together with the delay to
     * decide whether a skeleton is warranted and when the wait is over.
     */
    useEffect(() => {
        endWait();
    }, [queryKey, now, initialPage, endWait]);

    const placeholderCount = expectedCount > 0 ? expectedCount : initialPage.pageSize;

    if (isWaiting) {
        return (
            <section aria-label="搜索结果" aria-busy>
                <ResultsSkeleton count={placeholderCount} />
            </section>
        );
    }

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
 * Renders `page.items` directly instead of holding them in state: the page number lives in the URL, the
 * server renders the matching items, and copying them into a `useState` only creates a second copy that can
 * fall behind the first.
 */
function PaginatedResults({ page, now, fromHref }: PaginatedResultsProps) {
    const router = useRouter();

    const goToPage = useCallback(
        (next: number) => {
            const url = new URL(window.location.href);
            url.searchParams.set("curr", String(next));
            /*
             * A router navigation rather than `window.location.assign`: it keeps the App Router informed, so
             * the prefetched payload and the client cache are reused and the scroll position is restored by
             * the framework rather than by a full document load.
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
                        // A new page follows a visitor action, so its arrival is animated.
                        animate
                    />
                ))}
            </div>

            <div className={styles.pager}>
                <Pagination
                    current={page.page}
                    pageSize={page.pageSize}
                    total={page.total}
                    showSizeChanger={false}
                    // `total` is an upstream estimate that is demonstrably wrong for filtered queries, so
                    // quick-jump is offered only when the pager is clearly useful.
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
 * Every appended page is fetched through the `loadBookPage` Server Action, so the browser never contacts the
 * upstream index, the server data cache is reused, and the depth is mirrored into the URL with
 * `replaceState` purely so a reload or a share keeps the visitor's place.
 *
 * `hasMore` is tracked as state rather than read back from the initial page. Reading it from `initialPage`
 * would be wrong: after appending page 2 it still described page 1, so the sentinel reported "no more" and
 * scrolling stopped one page in.
 */
function InfiniteResults({ initialPage, query, now, fromHref }: InfiniteResultsProps) {
    const [books, setBooks] = useState<Book[]>(initialPage.items);
    const [loadedPage, setLoadedPage] = useState(initialPage.page);
    const [hasMore, setHasMore] = useState(initialPage.hasMore);
    const [isLoading, setIsLoading] = useState(false);

    const report = useUiStore((state) => state.report);

    /** Fetches one page and appends it. */
    const appendPage = useCallback(
        async (page: number) => {
            const result = await loadBookPage(query, page);

            if (!result.ok) {
                report({ message: result.message, retryable: result.retryable });
                return;
            }

            setBooks((previous) => {
                const seen = new Set(previous.map((book) => book.id));
                return [...previous, ...result.page.items.filter((book) => !seen.has(book.id))];
            });
            setLoadedPage(page);
            setHasMore(result.page.hasMore);

            // Mirror the depth into the URL without navigating: the visitor did not ask to go anywhere, so a
            // history entry would be wrong, but a reload or a share should land near where they stopped.
            const url = new URL(window.location.href);
            url.searchParams.set("curr", String(page));
            window.history.replaceState(null, "", url);
        },
        [query, report],
    );

    /**
     * Appends the next page.
     *
     * The sentinel and the retry in the failure modal both end up here, so a retry repeats the identical
     * request.
     */
    const loadNext = useCallback(() => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);
        void appendPage(loadedPage + 1).finally(() => setIsLoading(false));
    }, [appendPage, hasMore, isLoading, loadedPage]);

    /*
     * Let the failure modal repeat this read.
     *
     * Re-registered on every render so the action closes over the current query and page rather than the ones
     * in force when the request failed. Reading it happens in the modal's click handler, which keeps the
     * repeat out of an effect.
     */
    setRetryAction(loadNext);

    // Cards appended after the first page carry the entrance animation; the first page does not, because it
    // is already painted when the island hydrates and replaying the animation there would read as a flicker
    // on load.
    const firstPageCount = initialPage.items.length;

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
                        animate={index >= firstPageCount}
                    />
                ))}
            </div>

            <InfiniteTail hasMore={hasMore} isLoading={isLoading} onLoadMore={loadNext} />
        </section>
    );
}
