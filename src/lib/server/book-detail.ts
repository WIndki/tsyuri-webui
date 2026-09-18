import "server-only";

import { unstable_cache } from "next/cache";

import type { Book } from "@/lib/api/book";
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
import { BOOK_INDEX_CACHE_TAG } from "@/lib/server/book-index";

/*
 * The dispatcher is installed by importing `book-index` above. Keeping the import is what
 * guarantees the ordering, so this module must not fetch before that module has been evaluated.
 */

/**
 * Reads a single book.
 *
 * The upstream index exposes only `GET /book/searchByPage`; there is no detail endpoint (probed:
 * `book/detail`, `book/getById`, `book/queryById`, `book/info`, `book/{id}`, `book/searchById` all
 * return 404, and an `id=` query parameter is ignored, returning the unfiltered page).
 *
 * What does work is `keyword=`, which matches the book name. A full title normally matches exactly
 * one record, so the lookup is: search the title, then require a record whose `id` equals the one
 * in the URL.
 *
 * The `id` check is what makes this safe rather than approximate. Titles are not unique across
 * sources, and the upstream index is a crawl of five different sites, so without the check a
 * shared link could resolve to a different book than the one that was shared. A miss returns
 * `null` and the route renders `notFound()`.
 */
async function fetchBookByIdUncached(
    id: string,
    title: string,
): Promise<Book | null> {
    const url = upstreamUrl(UPSTREAM_SEARCH_PATH, {
        curr: 1,
        // Enough candidates to still find the record if the title is a common substring, without
        // asking upstream for a page it would have to serialise at length.
        limit: 24,
        sort: "last_index_update_time",
        keyword: title,
    });

    let response: Response;

    try {
        response = await fetch(url, {
            headers: upstreamHeaders(),
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
            cache: "no-store",
        });
    } catch (cause) {
        if (cause instanceof Error && cause.name === "TimeoutError") {
            throw new BookIndexError("timeout", "upstream request timed out", { cause });
        }
        throw new BookIndexError("network", "upstream request failed", { cause });
    }

    if (!response.ok) {
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
        console.error("[book-detail] upstream rejected request", {
            code: envelope.code,
            msg: envelope.msg,
            id,
        });

        throw new BookIndexError("upstream", `upstream code ${envelope.code}`, {
            upstreamMessage: envelope.msg,
            upstreamCode: envelope.code,
        });
    }

    const { page } = normalizePage(envelope);

    return page.items.find((book) => book.id === id) ?? null;
}

/**
 * Cached single-book read.
 *
 * A book's metadata changes on the order of hours, so this shares the index's longer revalidation
 * window and its cache tag.
 */
export async function getBookById(id: string, title: string): Promise<Book | null> {
    const cached = unstable_cache(
        () => fetchBookByIdUncached(id, title),
        ["book-detail", id, title],
        { revalidate: REVALIDATE.deeperPage, tags: [BOOK_INDEX_CACHE_TAG] },
    );

    return cached();
}
