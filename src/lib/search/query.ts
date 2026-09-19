/**
 * The search query model, plus parsing/validation from untrusted URL input.
 *
 * `SearchQuery` is the app's own normalized representation, reconciled between the two
 * shapes it sits between:
 *
 *   URL (untrusted, camelCase)  --parse-->  SearchQuery (validated, canonical)
 *   SearchQuery  --toUpstreamParams-->  upstream query string
 *   SearchQuery  --toSearchHref-->  canonical URL
 *
 * Everything here is pure and synchronous: it runs unchanged on the server, in the browser
 * and in tests. v1 had no such layer — validation was implicit, every call site did its own
 * `parseInt`, and unrecognised values were forwarded upstream verbatim.
 *
 * That last point matters more than it sounds. The upstream endpoint answers an
 * unrecognised `sort` or `purity` with `{"code":"500","data":null}` **at HTTP 200**, so
 * forwarding junk produces a blank page rather than an error anyone can act on. Every value
 * below is checked against its option table before it can reach the network.
 *
 * ## Single-value filters are a deliberate constraint
 *
 * `tag` and `source` accept exactly one value. This is not a UI simplification; it is what
 * upstream supports, established by measurement:
 *
 *   source=SF轻小说          -> total=63660
 *   source=SF轻小说,刺猬猫    -> total=0        multi-value matches nothing
 *   source=%2CSF轻小说        -> total=0        a leading comma alone kills it
 *
 *   tag=百合                 -> total=18030
 *   tag=百合,变百             -> total=84968    not a union: 300/300 sampled records
 *                                              matched 百合 only
 *   tag=百合,变身             -> total=0
 *
 * So comma-joining yields either an empty result set or an arbitrary single-value match.
 * v1 shipped the join form, which meant *every* filtered search with two or more tags
 * returned nothing. Modelling these as `string | undefined` makes the limitation impossible
 * to reintroduce by accident.
 */

import {
    BOOK_STATUS_VALUES,
    DEFAULT_PAGE_SIZE,
    DEFAULT_SORT,
    PAGE_BOUNDS,
    PAGE_SIZE_BOUNDS,
    PURITY_VALUES,
    SORT_VALUES,
    SOURCE_VALUES,
    TAG_VALUES,
    UPDATE_PERIOD_VALUES,
    WORD_COUNT_VALUES,
    type SortValue,
} from "./options";
import { truncate } from "@/lib/format";
import {
    DEFAULT_DISPLAY_MODE,
    isDisplayMode,
    type DisplayMode,
} from "@/lib/theme/display-mode";

/**
 * The facet portion of a query: everything the filter panel can change.
 *
 * Named separately from `SearchQuery` because `FilterControls` operates on these fields only, and a
 * function that takes the whole query could silently reach for `keyword` or `page`. `SearchQuery`
 * satisfies this type structurally, so a query can be passed directly.
 */
export interface FacetValues {
    /** Single tag filter. `undefined` = no constraint. */
    tag?: string;
    /** Single source filter. `undefined` = no constraint. */
    source?: string;
    bookStatus?: string;
    purity?: string;
    updatePeriod?: string;
    wordCountMin?: string;
    wordCountMax?: string;
}

export interface SearchQuery extends FacetValues {
    /** Free-text title/description search. Trimmed; empty means "no keyword". */
    keyword: string;
    /** 1-based page number. */
    page: number;
    pageSize: number;
    sort: SortValue;
    /**
     * How the results are presented.
     *
     * Part of the query rather than a client preference, because the two modes render different
     * documents: pagination shows one page, infinite scroll shows an accumulation. Making it a URL
     * parameter is what lets the server render the correct variant, which is what puts the books
     * in the initial HTML. It is also what makes a view shareable and the back button meaningful.
     * The visitor's first choice is remembered in `localStorage` and only used to redirect.
     */
    display: DisplayMode;
}

/** Shape of the untrusted input we are willing to parse. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

const MAX_KEYWORD_LENGTH = 100;

/**
 * Reads a single value from raw search params, taking the *last* occurrence.
 *
 * Repeated keys are otherwise ambiguous: `?curr=1&curr=2` arrives as an array. v1 appended arrays straight into
 * `URLSearchParams`, producing `curr=1,2` and a blank page. Resolving to the last value keeps a URL forgiving without
 * letting it be self-contradictory.
 */
export function singleParam(raw: RawSearchParams, key: string): string | undefined {
    const value = raw[key];
    if (Array.isArray(value)) return value.at(-1);
    return value;
}

function clampInt(
    value: string | undefined,
    { min, max, fallback }: { min: number; max: number; fallback: number },
): number {
    if (value === undefined) return fallback;

    // `Number.parseInt` on "12abc" returns 12; require the value to be fully numeric so a
    // malformed URL degrades to the default instead of silently becoming a different page.
    if (!/^\d+$/.test(value.trim())) return fallback;

    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max) return fallback;

    return parsed;
}

/**
 * Keeps a value only when it is one of `allowed`.
 *
 * Unknown values are dropped rather than forwarded, because upstream treats an
 * unrecognised enum value as a server error rather than a no-op.
 */
function oneOf(value: string | undefined, allowed: ReadonlySet<string>): string | undefined {
    if (value === undefined) return undefined;
    const trimmed = value.trim();
    if (!trimmed || !allowed.has(trimmed)) return undefined;
    return trimmed;
}

/**
 * Parses untrusted URL search params into a validated `SearchQuery`.
 *
 * Never throws: invalid input degrades to the corresponding default. A URL is user input
 * and must not be able to break the page or reach the upstream API unchecked.
 */
export function parseSearchQuery(raw: RawSearchParams = {}): SearchQuery {
    const wordCountMin = oneOf(singleParam(raw, "wordCountMin"), WORD_COUNT_VALUES);
    const wordCountMax = oneOf(singleParam(raw, "wordCountMax"), WORD_COUNT_VALUES);

    const display: DisplayMode = (() => {
        const value = singleParam(raw, "display");
        return isDisplayMode(value) ? value : DEFAULT_DISPLAY_MODE;
    })();

    const requestedPage = clampInt(singleParam(raw, "curr"), { ...PAGE_BOUNDS, fallback: 1 });

    return {
        /*
         * Truncated by code point, so an emoji at the boundary cannot be cut in half. A lone surrogate left by a
         * code-unit slice is not a character, and `encodeURIComponent` throws on one, which would take down every route
         * that builds a URL from this keyword.
         */
        keyword: truncate(singleParam(raw, "keyword") ?? "", MAX_KEYWORD_LENGTH),
        /*
         * Infinite scroll has no page to restore.
         *
         * It accumulates pages, so a `curr` in the URL names a depth the visitor was shown by scrolling rather than a
         * place they asked to be. Reading it would seed the accumulation part-way in — a return to the list would begin
         * at whatever page had been reached last, with the pages before it missing. Forcing one here means every
         * consumer, on both sides, agrees that an accumulation starts at the first page.
         */
        page: display === "pagination" ? requestedPage : 1,
        pageSize: clampInt(singleParam(raw, "limit"), {
            ...PAGE_SIZE_BOUNDS,
            fallback: DEFAULT_PAGE_SIZE,
        }),
        sort: (oneOf(singleParam(raw, "sort"), SORT_VALUES) ?? DEFAULT_SORT) as SortValue,
        display,
        tag: oneOf(singleParam(raw, "tag"), TAG_VALUES),
        source: oneOf(singleParam(raw, "source"), SOURCE_VALUES),
        bookStatus: oneOf(singleParam(raw, "bookStatus"), BOOK_STATUS_VALUES),
        purity: oneOf(singleParam(raw, "purity"), PURITY_VALUES),
        updatePeriod: oneOf(singleParam(raw, "updatePeriod"), UPDATE_PERIOD_VALUES),
        wordCountMin,
        /*
         * An upper bound below the lower bound selects nothing, so it is dropped rather than sent: the visitor gets the
         * widest sensible result set instead of an empty page with no explanation. Equality is kept, because both bounds
         * are inclusive, so `wordCountMin=50000&wordCountMax=50000` legitimately selects one band.
         */
        wordCountMax:
            wordCountMin !== undefined &&
            wordCountMax !== undefined &&
            Number(wordCountMax) < Number(wordCountMin)
                ? undefined
                : wordCountMax,
    };
}

interface UpstreamSearchParams {
    /**
     * Index signature so this interface is structurally assignable to
     * `Record<string, string | number | undefined>`, which is what the URL builder accepts.
     * Declared explicitly rather than inferred, because all the filters below are optional.
     */
    [key: string]: string | number | undefined;
    curr: number;
    limit: number;
    sort: string;
    keyword?: string;
    tag?: string;
    source?: string;
    bookStatus?: string;
    purity?: string;
    updatePeriod?: string;
    wordCountMin?: string;
    wordCountMax?: string;
}

/**
 * Converts a `SearchQuery` into the exact parameter set the upstream index expects.
 *
 * Values are handed to `URLSearchParams` unencoded, which percent-encodes them exactly once.
 * Percent-encoding is mandatory: raw unencoded UTF-8 in the query string is rejected at the
 * front door with HTTP 400 and an empty body. v1 pre-encoded by hand
 * (`"%2C" + tags.join("%2C")`) and then let `URLSearchParams` encode the result again — the
 * source of both the double-encoding and the empty-filter bug.
 */
export function toUpstreamParams(query: SearchQuery): UpstreamSearchParams {
    const params: UpstreamSearchParams = {
        // Clamped defensively in addition to `parseSearchQuery`, because `limit=0` makes
        // upstream serialise the entire 87,233-record table.
        curr: Math.min(PAGE_BOUNDS.max, Math.max(PAGE_BOUNDS.min, Math.trunc(query.page) || PAGE_BOUNDS.min)),
        limit: Math.min(PAGE_SIZE_BOUNDS.max, Math.max(PAGE_SIZE_BOUNDS.min, Math.trunc(query.pageSize) || PAGE_SIZE_BOUNDS.min)),
        sort: query.sort,
    };

    if (query.keyword) params.keyword = query.keyword;
    if (query.tag) params.tag = query.tag;
    if (query.source) params.source = query.source;
    if (query.bookStatus) params.bookStatus = query.bookStatus;
    if (query.purity) params.purity = query.purity;
    if (query.updatePeriod) params.updatePeriod = query.updatePeriod;
    if (query.wordCountMin) params.wordCountMin = query.wordCountMin;
    if (query.wordCountMax) params.wordCountMax = query.wordCountMax;

    return params;
}

/**
 * Serializes to a URL query string, omitting every value that equals the default.
 *
 * This is what makes `/search?keyword=x` and `/search?keyword=x&sort=last_index_update_time`
 * the same canonical URL. v1 emitted every parameter on every render, so a single logical
 * view had many distinct URLs — which defeats the data cache, since each variant is its own
 * cache key, and pollutes browser history.
 */
export function toSearchParams(query: SearchQuery): URLSearchParams {
    const params = new URLSearchParams();

    if (query.keyword) params.set("keyword", query.keyword);
    if (query.page > 1) params.set("curr", String(query.page));
    if (query.pageSize !== DEFAULT_PAGE_SIZE) params.set("limit", String(query.pageSize));
    if (query.sort !== DEFAULT_SORT) params.set("sort", query.sort);
    // Emitted whenever it differs from the default, so a shared link preserves the presentation the
    // sender was looking at. The server needs it to decide which document to build.
    if (query.display !== DEFAULT_DISPLAY_MODE) params.set("display", query.display);
    if (query.tag) params.set("tag", query.tag);
    if (query.source) params.set("source", query.source);
    if (query.bookStatus) params.set("bookStatus", query.bookStatus);
    if (query.purity) params.set("purity", query.purity);
    if (query.updatePeriod) params.set("updatePeriod", query.updatePeriod);
    if (query.wordCountMin) params.set("wordCountMin", query.wordCountMin);
    if (query.wordCountMax) params.set("wordCountMax", query.wordCountMax);

    return params;
}

/** Canonical path for a query, used by `useRouter` and for `<Link>` hrefs. */
export function toSearchHref(query: SearchQuery): string {
    const search = toSearchParams(query).toString();
    return search ? `/search?${search}` : "/search";
}

/** True when the query narrows the result set beyond "everything, page 1". */
export function hasActiveFilters(query: SearchQuery): boolean {
    return countActiveFilters(query) > 0 || query.keyword.length > 0;
}

/**
 * The URL of a book's record.
 *
 * Built here rather than inside the card, because two places need the identical string: the link the card renders, and
 * the prefetch the results island issues for the first cards. A second construction would let the prefetched URL drift
 * from the linked one, and a prefetch that does not match its link is a request that helps nobody.
 *
 * `from` carries the result view the visitor is looking at, so closing the record returns them to those filters.
 */
export function toBookHref(book: { id: string; title: string }, from: string): string {
    return `/book/${book.id}?title=${encodeURIComponent(book.title)}&from=${encodeURIComponent(from)}`;
}

/** Number of facet filters currently applied, for the collapsed-panel badge. */
export function countActiveFilters(facets: FacetValues): number {
    return [
        facets.tag,
        facets.source,
        facets.bookStatus,
        facets.purity,
        facets.updatePeriod,
        facets.wordCountMin,
        facets.wordCountMax,
    ].filter((value) => value !== undefined).length;
}

/**
 * Returns a copy of `query` moved to `page`, clamped into `PAGE_BOUNDS`.
 *
 * Every filter change must go through this: keeping `curr=7` while the filters change routinely lands the visitor past the
 * end of the new result set, which renders as an empty page with no explanation.
 *
 * A page that is not a whole number is replaced rather than clamped. `Math.min`/`Math.max` pass `NaN` straight through,
 * and a fractional page reaches upstream as `curr=1.5`, which it answers with an error.
 */
export function withPage(query: SearchQuery, page: number): SearchQuery {
    const bounded =
        Number.isInteger(page) && page >= PAGE_BOUNDS.min && page <= PAGE_BOUNDS.max ? page : 1;

    return {
        ...query,
        page: bounded,
    };
}

/**
 * Merges a patch into `query`, resetting to page 1 unless the patch sets a page itself.
 *
 * `undefined` values in the patch clear the corresponding filter, which is how the UI
 * expresses "不限".
 */
export function withPatch(query: SearchQuery, patch: Partial<SearchQuery>): SearchQuery {
    const next = { ...query, ...patch };
    return patch.page === undefined ? withPage(next, 1) : next;
}

/**
 * Rebuilds a query from a value that arrived over the wire.
 *
 * `parseSearchQuery` is not enough on its own: it reads URL strings, while a Server Action receives a deserialised
 * object whose fields a hostile caller can set to anything — a page of `NaN` or `1.5`, an unknown `sort`, a page size
 * outside the bounds, a keyword of any length. Every field is therefore taken back through the same tables and bounds the
 * URL path uses, and anything unrecognised is dropped rather than forwarded.
 *
 * This is the entry point that matters most, because the Server Action is a public HTTP endpoint and the bounds it
 * enforces are load-bearing: `limit=0` makes upstream serialise its entire table, and an unrecognised `sort` is answered
 * with a server error rather than a fallback.
 */
export function sanitizeQuery(input: unknown): SearchQuery {
    const source = (typeof input === "object" && input !== null ? input : {}) as Record<
        string,
        unknown
    >;

    const asText = (value: unknown): string | undefined =>
        typeof value === "string" ? value : undefined;

    const number = (value: unknown, bounds: { min: number; max: number }, fallback: number): number =>
        typeof value === "number" && Number.isInteger(value) && value >= bounds.min && value <= bounds.max
            ? value
            : fallback;

    const display: DisplayMode = isDisplayMode(source.display) ? source.display : DEFAULT_DISPLAY_MODE;
    const requestedPage = number(source.page, PAGE_BOUNDS, 1);

    return {
        ...parseSearchQuery({
            keyword: asText(source.keyword),
            curr: String(requestedPage),
            limit: String(number(source.pageSize, PAGE_SIZE_BOUNDS, DEFAULT_PAGE_SIZE)),
            sort: asText(source.sort),
            display,
            tag: asText(source.tag),
            source: asText(source.source),
            bookStatus: asText(source.bookStatus),
            purity: asText(source.purity),
            updatePeriod: asText(source.updatePeriod),
            wordCountMin: asText(source.wordCountMin),
            wordCountMax: asText(source.wordCountMax),
        }),
        /*
         * Infinite scroll has no page, so a caller that alleges one is not believed even when the number is a valid page.
         * `parseSearchQuery` applies the same rule for the URL path.
         */
        page: display === "pagination" ? requestedPage : 1,
    };
}

/** Drops every filter but keeps paging preferences. */
export function clearedFilters(query: SearchQuery): SearchQuery {
    return {
        keyword: "",
        page: 1,
        pageSize: query.pageSize,
        sort: DEFAULT_SORT,
        display: query.display,
    };
}
