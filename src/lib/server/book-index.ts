import "server-only";

/**
 * Server-side reader for the upstream book index.
 *
 * This is the only module in the application that performs a network request for book data.
 * It is marked `server-only`, so importing it from a Client Component is a build error
 * rather than a silent bundle-size and secret-leak problem.
 *
 * Responsibilities, in order:
 *   1. build the upstream request from a validated `SearchQuery`
 *   2. enforce a timeout
 *   3. unwrap and validate the envelope
 *   4. normalize transport JSON into domain objects
 *   5. cache the result
 *
 * v1 did steps 1, 3 and 4 in the browser inside a Redux query, and proxied step 1 through
 * `middleware.ts` to dodge CORS. Doing it here removes that hop from the critical path and
 * lets the first page of results ship as HTML.
 */

import { revalidateTag, unstable_cache } from "next/cache";

import type { BookPage } from "@/lib/api/book";
import { BookIndexError } from "@/lib/api/errors";
import { normalizePage, parseEnvelope } from "@/lib/api/normalize";
import { isUpstreamSuccess } from "@/lib/api/upstream-types";
import {
    REVALIDATE,
    UPSTREAM_SEARCH_PATH,
    UPSTREAM_TIMEOUT_MS,
    upstreamHeaders,
    upstreamUrl,
} from "@/lib/api/upstream";
import { configureProxyDispatcher } from "@/lib/server/proxy-dispatcher";
import { toUpstreamParams, type SearchQuery } from "@/lib/search/query";

// Node's fetch ignores `HTTPS_PROXY` on its own, so the dispatcher is installed before the first
// request. See `proxy-dispatcher.ts`.
configureProxyDispatcher();

export const BOOK_INDEX_CACHE_TAG = "book-index";

/**
 * Fetches and normalizes one page of search results.
 *
 * Throws `BookIndexError` on any failure; callers branch on `.kind` rather than on message
 * text. Never returns a partial page — either the page is complete or it throws.
 */
async function fetchBookPageUncached(query: SearchQuery): Promise<BookPage> {
    const url = upstreamUrl(UPSTREAM_SEARCH_PATH, toUpstreamParams(query));

    let response: Response;

    try {
        response = await fetch(url, {
            headers: upstreamHeaders(),
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
            // Caching is applied by the `unstable_cache` wrapper below. Disabling fetch's own
            // cache avoids two competing layers with different lifetimes.
            cache: "no-store",
        });
    } catch (cause) {
        if (cause instanceof Error && cause.name === "TimeoutError") {
            throw new BookIndexError("timeout", "upstream request timed out", { cause });
        }
        if (cause instanceof Error && cause.name === "AbortError") {
            throw new BookIndexError("aborted", "upstream request aborted", { cause });
        }
        throw new BookIndexError("network", "upstream request failed", { cause });
    }

    if (!response.ok) {
        // Not the normal failure path: upstream was observed to answer HTTP 200 even for
        // server errors. A genuine non-2xx is a framework-level rejection (406/405/403/400).
        throw new BookIndexError("upstream", `upstream returned HTTP ${response.status}`, {
            upstreamMessage: response.statusText,
        });
    }

    let body: unknown;
    try {
        body = await response.json();
    } catch (cause) {
        throw new BookIndexError("malformed", "upstream body was not valid JSON", { cause });
    }

    const envelope = parseEnvelope(body);
    if (!envelope) {
        throw new BookIndexError("malformed", "upstream body did not match the envelope shape");
    }

    if (!isUpstreamSuccess(envelope)) {
        // Log the raw upstream message; never surface it. It is sometimes an internal hint
        // ("未知异常，请联系管理员！") and sometimes a coercion failure that tells a visitor
        // nothing about what they did wrong.
        console.error("[book-index] upstream rejected request", {
            code: envelope.code,
            msg: envelope.msg,
            query,
        });

        throw new BookIndexError("upstream", `upstream code ${envelope.code}`, {
            upstreamMessage: envelope.msg,
            upstreamCode: envelope.code,
        });
    }

    const { page, droppedCount } = normalizePage(envelope);

    if (droppedCount > 0) {
        console.warn("[book-index] dropped malformed records", {
            droppedCount,
            received: envelope.data.list.length,
            query,
        });
    }

    return page;
}

/**
 * Builds the cache key for a query.
 *
 * `JSON.stringify` over an object literal built in a fixed field order gives a stable,
 * collision-free key part. Field order matters: `?keyword=a&tag=b` and `?tag=b&keyword=a`
 * normalize to the same key, so they share one cache entry instead of duplicating work.
 */
function cacheKeyFor(query: SearchQuery): string {
    return JSON.stringify({
        keyword: query.keyword,
        page: query.page,
        pageSize: query.pageSize,
        sort: query.sort,
        tag: query.tag ?? null,
        source: query.source ?? null,
        bookStatus: query.bookStatus ?? null,
        purity: query.purity ?? null,
        updatePeriod: query.updatePeriod ?? null,
        wordCountMin: query.wordCountMin ?? null,
        wordCountMax: query.wordCountMax ?? null,
    });
}

/**
 * Reads one page of results, served from Next.js' data cache when warm.
 *
 * `unstable_cache` serializes whatever the inner function returns with `JSON.stringify` before
 * storing it, and parses it back on a hit. Every value in `BookPage` therefore has to be
 * JSON-representable: a `Date` would be stored as an ISO string and come back as a `string`
 * while the type still claimed `Date`, which is how `a.getTime is not a function` reached
 * production. Timestamps are epoch milliseconds for exactly this reason.
 *
 * Revalidation: page 1 is the hot path and is shared by every visitor with the same
 * filters, so it gets the shorter window. Deeper pages are colder and cheaper to serve
 * stale.
 */
export async function getBookPage(query: SearchQuery): Promise<BookPage> {
    const cached = unstable_cache(
        () => fetchBookPageUncached(query),
        ["book-page", cacheKeyFor(query)],
        {
            revalidate: query.page === 1 ? REVALIDATE.firstPage : REVALIDATE.deeperPage,
            tags: [BOOK_INDEX_CACHE_TAG],
        },
    );

    return cached();
}

/**
 * Invalidates every cached page.
 *
 * Exposed through a route handler so the index can be refreshed on demand after upstream
 * backfills data, without waiting out the revalidate window.
 */
export function revalidateBookIndex(): void {
    // Next.js 16 requires an explicit cache profile when expiring a tag.
    revalidateTag(BOOK_INDEX_CACHE_TAG, "max");
}
