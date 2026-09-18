import { Suspense } from "react";

import type { Metadata } from "next";

import { ResultsIsland } from "@/components/book/results-island";
import { DisplayModePreference } from "@/components/search/display-mode-preference";
import { EmptyResults } from "@/components/search/empty-results";
import { ResultsSummary } from "@/components/search/results-summary";
import { SearchBar } from "@/components/search/search-bar";
import { SearchPanel } from "@/components/search/search-panel";
import { emptyBookPage } from "@/lib/api/book";
import { BookIndexError, userMessageFor } from "@/lib/api/errors";
import { parseSearchQuery, toSearchHref, type RawSearchParams } from "@/lib/search/query";
import { getBookPage } from "@/lib/server/book-index";
import { requestTimestamp } from "@/lib/server/request-timestamp";

import styles from "./page.module.css";

/**
 * The search page.
 *
 * A Server Component. `searchParams` is parsed and validated here, the first page of results is
 * fetched here, and the cards are rendered into the HTML — so the visitor sees books in the
 * first paint, with no client fetch and no loading spinner on the critical path.
 *
 * This is the central change from v1, which rendered an empty shell and only issued its request
 * after hydration *and* after a Redux `router.isInitialized` flag flipped: at least two client
 * render passes before any content was even requested.
 */

interface SearchPageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
    const query = parseSearchQuery((await searchParams) as RawSearchParams);

    // A filtered view is worth indexing under its own title, but the combinations are
    // near-infinite — so only the keyword form gets a descriptive title and a canonical URL.
    if (!query.keyword) return {};

    return {
        title: `${query.keyword} 的搜索结果`,
        description: `小说搜索：${query.keyword}`,
        alternates: { canonical: `/search?keyword=${encodeURIComponent(query.keyword)}` },
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const query = parseSearchQuery((await searchParams) as RawSearchParams);

    // Pinned once per request so the relative "updated N days ago" labels rendered on the server
    // match the ones rendered on the client after hydration.
    const now = requestTimestamp();

    let page = emptyBookPage(query.page, query.pageSize);
    let error: BookIndexError | null = null;

    try {
        page = await getBookPage(query);
    } catch (caught) {
        // Rendered as content rather than thrown: `error.tsx` replaces the entire route, which
        // would also remove the search bar and the filter panel the visitor needs in order to
        // recover.
        error =
            caught instanceof BookIndexError
                ? caught
                : new BookIndexError("unknown", "unrecognized failure", { cause: caught });
    }

    const noResults = error === null && page.items.length === 0;

    /*
     * Canonical URL of this result view, built from the validated query rather than from the raw
     * request. Every detail link carries it, so returning from a book restores the exact filters
     * and page the visitor was on.
     */
    const fromHref = toSearchHref(query);

    return (
        <div className={styles.page}>
            {/*
             * Redirects once to the visitor's preferred display mode when the URL does not state one.
             * Rendered first because it changes the URL the rest of the controls read.
             */}
            <DisplayModePreference />

            <SearchBar query={query} />

            <Suspense fallback={null}>
                <SearchPanel query={query} />
            </Suspense>

            <ResultsSummary page={page} query={query} />

            {error ? (
                <p role="alert" className={styles.error}>
                    {userMessageFor(error)}
                </p>
            ) : null}

            {noResults ? <EmptyResults query={query} /> : null}

            {page.items.length > 0 ? (
                <ResultsIsland
                    initialPage={page}
                    query={query}
                    now={now}
                    fromHref={fromHref}
                />
            ) : null}
        </div>
    );
}
