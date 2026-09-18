/**
 * The application's own book model.
 *
 * Deliberately separate from `UpstreamBook`. The upstream shape is a transport detail: it
 * stringifies every number, carries sixteen permanently-null columns, and conflates "no
 * value" between `null` and `""`. Components should never see any of that.
 *
 * `normalizeBook` is the single boundary that converts one into the other, so the rest of
 * the app works with real `number`s, real `Date`s and a de-duplicated tag list.
 */

/**
 * `bookStatus` is a stringified boolean upstream. Declared here rather than in the
 * transport types so that components can depend on the domain model alone and never pull
 * the upstream shape into a client bundle.
 */
export type BookStatus = "0" | "1";

export interface Book {
    id: string;
    title: string;
    author: string;
    description: string;
    /**
     * Ready-to-render cover URL.
     *
     * Upstream returns a mix of absolute third-party CDN URLs (≈69%) and root-relative
     * `/localPic/...` paths (≈31%) in the same field. Both are resolved to something the
     * browser can load, so components can pass this straight to `<Image>` without
     * branching. Falls back to a bundled placeholder when the value is unusable.
     */
    coverUrl: string;
    source: string;
    category: string | null;
    status: BookStatus;
    /** Parsed integer. `null` when the upstream value was unparseable. */
    wordCount: number | null;
    /**
     * Last update instant as epoch milliseconds, or `null` when unparseable.
     *
     * A number rather than a `Date`, because this object passes through
     * `unstable_cache`, which serializes with `JSON.stringify` and therefore returns a plain
     * ISO string in place of any `Date`. Modelling the instant as a number means the value
     * survives caching, the server/client boundary and the Server Action boundary unchanged,
     * so the type stays truthful everywhere. `formatRelativeDate` converts it for display.
     */
    updatedAtMs: number | null;
    /** De-duplicated, order-preserving union of the `tag` and `newTag` fields. */
    tags: string[];
    /** Raw grade code: `"A+" | "A" | "A-" | "B+" | "B" | "-" | "--" | "---" | ""`. */
    purity: string;
    /** Reader-facing purity label, or `null` when the record is ungraded. */
    purityLabel: string | null;
}

/**
 * Maps a raw upstream purity grade onto a reader-facing label.
 *
 * Two encodings coexist in the data — letter grades and an older dash scale — plus an empty
 * string for ungraded records, which is the single most common value. Unrecognised values
 * are passed through verbatim rather than dropped, so a future upstream change degrades to
 * "shows the raw code" instead of silently showing nothing.
 */
const PURITY_LETTERS: Record<string, string> = {
    "A+": "A+",
    A: "A",
    "A-": "A-",
    "B+": "B+",
    B: "B",
};

const PURITY_LEGACY: Record<string, string> = {
    "-": "B-",
    "--": "C",
    "---": "C-",
};

export function purityLabel(purity: string): string | null {
    const value = purity.trim();
    if (!value) return null;

    return PURITY_LETTERS[value] ?? PURITY_LEGACY[value] ?? value;
}

/** A page of normalized results plus the metadata needed to paginate. */
export interface BookPage {
    items: Book[];
    /**
     * Matching records across all pages, as reported upstream.
     *
     * **Display estimate only.** Measured to be inaccurate for filtered queries — see the
     * `total` note in `upstream-types.ts`. Never use it to decide whether a next page
     * exists; use `hasMore`, which is derived from the observed page contents.
     */
    total: number;
    /** The page number that was requested (upstream echoes it verbatim). */
    page: number;
    pageSize: number;
    /**
     * `true` when more results are likely available.
     *
     * Derived from `items.length === pageSize` rather than from `total`, because `total` is
     * unreliable for filtered queries and because a short page is the only end-of-list
     * signal the upstream API actually provides.
     */
    hasMore: boolean;
}

export function emptyBookPage(page = 1, pageSize = 0): BookPage {
    return { items: [], total: 0, page, pageSize, hasMore: false };
}
