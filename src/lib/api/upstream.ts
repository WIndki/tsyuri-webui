/**
 * Upstream endpoint configuration.
 *
 * Deliberately *not* marked `server-only`: cover resolution needs the origin client-side
 * too, and the origin is public information already embedded in every response. Anything
 * secret would belong in `lib/server/`, not here.
 */

/** Origin of the third-party index that fronts all of this data. */
export const UPSTREAM_ORIGIN = "https://index.tsyuri.com";

/** Path of the search endpoint. */
export const UPSTREAM_SEARCH_PATH = "/book/searchByPage";

/**
 * Server-side timeout for a single upstream request.
 *
 * Measured latency was 0.7–1.9 s for 20 records and 1.4–2.4 s for 500, with a large fixed
 * per-request cost (~0.7 s even for `limit=2`) dominated by origin processing rather than
 * connection setup. Latency is also erratic — the same `limit=1000` ranged 0.93 s to 30.3 s.
 * 8 s leaves headroom for a slow day while failing well before a visitor gives up.
 *
 * v1 configured a 5 s client timeout *plus* five exponential-backoff retries
 * (1+2+4+8+16 s), so a persistently failing search could hang for over a minute.
 */
export const UPSTREAM_TIMEOUT_MS = 8_000;

/**
 * Revalidation windows, in seconds.
 *
 * The endpoint sets no cache headers of its own (`cf-cache-status: DYNAMIC`), so every
 * uncached call costs the full origin round-trip. Content changes slowly — the newest
 * `lastIndexUpdateTime` in the corpus was 7 days old at sampling time — so aggressive
 * caching is both safe and necessary.
 */
export const REVALIDATE = {
    /** Page 1 of any query: the hot path, shared by every visitor with the same filters. */
    firstPage: 300,
    /** Deeper pages are colder and cheaper to serve stale. */
    deeperPage: 900,
} as const;

/**
 * Request headers.
 *
 * Empirically, upstream requires **only** an `Accept` that permits JSON. A bare request
 * with no headers at all succeeds; `Referer`, `User-Agent`, `Accept-Language`,
 * `Cache-Control`, `Pragma` and `DNT` are all ignored, and a foreign or absent `Referer`
 * makes no difference. `Accept: text/html` is answered with `406`, which is the one way to
 * get this wrong.
 *
 * v1 sent a full browser-impersonation header set, which was unnecessary. What remains is
 * a stable `User-Agent` — polite when reading someone else's index — and an explicit
 * `Accept`.
 */
export function upstreamHeaders(): HeadersInit {
    return {
        // Load-bearing: must permit JSON. See the note above.
        Accept: "application/json",
        // Identifies this client honestly rather than impersonating a browser.
        "User-Agent": "tsyuri-webui/0.2 (read-only novel index client)",
    };
}

/** Builds an absolute upstream URL from a path and query parameters. */
export function upstreamUrl(
    path: string,
    params: URLSearchParams | Record<string, unknown>,
): string {
    const url = new URL(path, UPSTREAM_ORIGIN);

    const search =
        params instanceof URLSearchParams
            ? params
            : new URLSearchParams(
                  Object.entries(params)
                      .filter(([, value]) => value !== undefined)
                      .map(([key, value]) => [key, String(value)]),
              );

    url.search = search.toString();
    return url.toString();
}
