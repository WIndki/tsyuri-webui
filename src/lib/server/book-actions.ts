"use server";

import type { BookPage } from "@/lib/api/book";
import { isRetryable, userMessageFor } from "@/lib/api/errors";
import { getBookPage } from "@/lib/server/book-index";
import { withPage, withPatch, type SearchQuery } from "@/lib/search/query";

/**
 * Loads one page of results on behalf of a Client Component.
 *
 * Exists so that infinite scrolling can append results without the browser ever talking to the
 * upstream index. The alternative — exposing the upstream endpoint to the client — would leak
 * the source, defeat the server cache, and reintroduce the CORS problem the proxy exists to
 * solve.
 *
 * Arguments arrive from a Client Component and are therefore **untrusted**: a Server Action is
 * a public HTTP endpoint, so anything the client can send, a hostile client can send too. The
 * `SearchQuery` is re-validated here with `withPage`/`withPatch`, which re-apply the page and
 * page-size bounds. Those bounds are load-bearing: `limit=0` makes upstream serialise its
 * entire 87,233-record table (103 MB, 163 s), and an unrecognised `sort` is answered with a
 * server error rather than a fallback.
 *
 * Failures are returned as values rather than thrown. A thrown error inside a transition
 * surfaces as an opaque runtime error in production, and the caller needs the failure kind to
 * decide whether to offer a retry.
 */
type LoadBookPageResult =
    | { ok: true; page: BookPage }
    | { ok: false; message: string; retryable: boolean };

export async function loadBookPage(
    query: SearchQuery,
    page: number,
): Promise<LoadBookPageResult> {
    // Re-clamp instead of trusting the caller.
    const safeQuery = withPage(withPatch(query, {}), page);

    try {
        return { ok: true, page: await getBookPage(safeQuery) };
    } catch (error) {
        console.error("[loadBookPage] failed", { query: safeQuery, error });

        return {
            ok: false,
            message: userMessageFor(error),
            retryable: isRetryable(error),
        };
    }
}
