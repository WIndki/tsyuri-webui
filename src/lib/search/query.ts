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
 * Repeated keys are otherwise ambiguous: `?curr=1&curr=2` arrives as an array. v1 appended
 * arrays straight into `URLSearchParams`, producing `curr=1,2` and a blank page. Resolving
 * to the last value keeps a URL forgiving without letting it be self-contradictory.
 */
function single(raw: RawSearchParams, key: string): string | undefined {
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
    const wordCountMin = oneOf(single(raw, "wordCountMin"), WORD_COUNT_VALUES);
    const wordCountMax = oneOf(single(raw, "wordCountMax"), WORD_COUNT_VALUES);

    const display: DisplayMode = (() => {
        const value = single(raw, "display");
        return isDisplayMode(value) ? value : DEFAULT_DISPLAY_MODE;
    })();

    const requestedPage = clampInt(single(raw, "curr"), { ...PAGE_BOUNDS, fallback: 1 });

    return {
        keyword: (single(raw, "keyword") ?? "").trim().slice(0, MAX_KEYWORD_LENGTH),
        /*
         * Infinite scroll has no page to restore.
         *
         * It accumulates pages, so a `curr` in the URL names a depth the visitor was shown by scrolling rather than a
         * place they asked to be. Reading it would seed the accumulation part-way in — a return to the list would begin
         * at whatever page had been reached last, with the pages before it missing. Forcing one here means every
         * consumer, on both sides, agrees that an accumulation starts at the first page.
         */
        page: display === "pagination" ? requestedPage : 1,
        pageSize: clampInt(single(raw, "limit"), {
            ...PAGE_SIZE_BOUNDS,
            fallback: DEFAULT_PAGE_SIZE,
        }),
        sort: (oneOf(single(raw, "sort"), SORT_VALUES) ?? DEFAULT_SORT) as SortValue,
        display,
        tag: oneOf(single(raw, "tag"), TAG_VALUES),
        source: oneOf(single(raw, "source"), SOURCE_VALUES),
        bookStatus: oneOf(single(raw, "bookStatus"), BOOK_STATUS_VALUES),
        purity: oneOf(single(raw, "purity"), PURITY_VALUES),
        updatePeriod: oneOf(single(raw, "updatePeriod"), UPDATE_PERIOD_VALUES),
        wordCountMin,
        // A lower bound at or above the upper bound can never match, so the upper bound is
        // dropped to leave the widest sensible result set rather than an empty page the user
        // cannot explain. Upstream validates nothing here and would happily return nothing.
        wordCountMax:
            wordCountMin !== undefined &&
            wordCountMax !== undefined &&
            Number(wordCountMax) <= Number(wordCountMin)
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
        curr: Math.max(PAGE_BOUNDS.min, query.page),
        limit: Math.min(PAGE_SIZE_BOUNDS.max, Math.max(PAGE_SIZE_BOUNDS.min, query.pageSize)),
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
 * Returns a copy of `query` reset to page 1.
 *
 * Every filter change must go through this: keeping `curr=7` while the filters change
 * routinely lands the user past the end of the new result set, which renders as an empty
 * page with no explanation.
 */
export function withPage(query: SearchQuery, page: number): SearchQuery {
    return {
        ...query,
        page: Math.max(PAGE_BOUNDS.min, Math.min(page, PAGE_BOUNDS.max)),
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
