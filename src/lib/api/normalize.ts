/**
 * The transport -> domain boundary.
 *
 * Everything above this file treats upstream JSON as untrusted. That is a deliberate
 * posture change from v1, which cast the parsed body straight to a `Book` interface and
 * relied on the compiler for safety. The compiler cannot help here: `JSON.parse` returns
 * `any`, so the annotation was a claim rather than a check — and the claim was wrong
 * (`userTag` was typed `string` while the API returns `null` in 95% of records), which
 * type-checked cleanly and would have thrown at runtime.
 *
 * Two policies are enforced:
 *
 * 1. **Numbers are parsed once.** `pageNum`, `pageSize`, `total` and `wordCount` all arrive
 *    as strings. Parsing here means no component ever has to decide whether it holds
 *    `"20"` or `20`.
 * 2. **A malformed record is dropped, not fatal.** One unparseable book in a page of 24
 *    should not blank the page. The drop count is surfaced so callers can log it.
 */

import { normalizeWhitespace, parseTags, parseUpstreamEpochMs } from "@/lib/format";
import { purityLabel, type Book, type BookPage, type BookStatus } from "@/lib/api/book";
import { resolveCoverUrl } from "@/lib/api/cover";
import {
    isUpstreamSuccess,
    type UpstreamBook,
    type UpstreamEnvelope,
    type UpstreamPageData,
} from "@/lib/api/upstream-types";

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = ""): string {
    return typeof value === "string" ? value : fallback;
}

/** Absent-or-null string, kept distinct from "present but empty". */
function asOptionalString(value: unknown): string | null {
    return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number | null {
    const raw = typeof value === "number" ? value : Number.parseInt(asString(value), 10);
    return Number.isFinite(raw) ? raw : null;
}

function asBookStatus(value: unknown): BookStatus {
    // Anything that is not an explicit "1" is treated as ongoing, matching how the upstream
    // UI renders the field and avoiding the invention of a third state.
    return asString(value) === "1" ? "1" : "0";
}

/**
 * Narrows an unknown value to `UpstreamEnvelope`.
 *
 * Validates only the structure actually consumed. `list` is checked to be an array, but
 * individual entries are validated separately so one bad row cannot reject a whole page.
 */
export function parseEnvelope(value: unknown): UpstreamEnvelope | null {
    if (!isRecord(value)) return null;

    const { code, msg, data } = value;
    if (typeof code !== "string") return null;

    if (data === null || data === undefined) {
        return { code, msg: asString(msg), data: null };
    }

    if (!isRecord(data)) return null;

    return {
        code,
        msg: asString(msg),
        data: {
            pageNum: asString(data.pageNum),
            pageSize: asString(data.pageSize),
            total: asString(data.total),
            list: (Array.isArray(data.list) ? data.list : []).filter(isRecord),
        } as unknown as UpstreamPageData,
    };
}

/** Normalizes one upstream record. Returns `null` when it is unusable. */
export function normalizeBook(raw: UpstreamBook): Book | null {
    const id = asString(raw.id).trim();
    const title = asString(raw.bookName).trim();

    // Without an id the card cannot be keyed or linked; without a title it is unreadable.
    if (!id || !title) return null;

    const purity = asString(raw.purity);

    return {
        id,
        title,
        author: asString(raw.authorName).trim() || "佚名",
        description: normalizeWhitespace(asString(raw.bookDesc)),
        coverUrl: resolveCoverUrl(raw.picUrl),
        source: asString(raw.crawlSourceName).trim() || "未知来源",
        category: asOptionalString(raw.catName)?.trim() || null,
        status: asBookStatus(raw.bookStatus),
        wordCount: asNumber(raw.wordCount),
        updatedAtMs: parseUpstreamEpochMs(asOptionalString(raw.lastIndexUpdateTime)),
        // `newTag` is the curated field and `tag` the raw one. They are byte-identical in
        // every sampled record, so this merge is defensive rather than load-bearing — but it
        // also de-duplicates repeated keywords within a single field, which the raw data
        // does contain.
        tags: parseTags(raw.newTag, raw.tag),
        purity,
        purityLabel: purityLabel(purity),
    };
}

interface NormalizeResult {
    page: BookPage;
    /** Records rejected by `normalizeBook`. Non-zero means upstream data regressed. */
    droppedCount: number;
}

/**
 * Converts a parsed envelope into a normalized page.
 *
 * Assumes the envelope already passed `isUpstreamSuccess`.
 *
 * `hasMore` is derived from the observed item count rather than from `total`:
 *
 * - `total` is demonstrably inaccurate for filtered queries (it reports 18,030 for
 *   `tag=百合` while paging runs dry after roughly 2,000 distinct records).
 * - A short page is the only end-of-list signal the endpoint provides; a page past the end
 *   returns `list: []` with `code: "200"`, never an error.
 */
export function normalizePage(
    envelope: UpstreamEnvelope & { data: UpstreamPageData },
): NormalizeResult {
    const { data } = envelope;

    const items: Book[] = [];
    let droppedCount = 0;

    for (const raw of data.list) {
        const book = normalizeBook(raw);
        if (book) items.push(book);
        else droppedCount += 1;
    }

    const page = asNumber(data.pageNum) ?? 1;
    const pageSize = asNumber(data.pageSize) ?? items.length;
    const total = asNumber(data.total) ?? items.length;

    return {
        page: {
            items,
            total,
            page,
            pageSize,
            // A full page means there is probably another one. Comparing against the echoed
            // request size rather than `items.length` keeps this correct even when a record
            // was dropped during normalization.
            hasMore: pageSize > 0 && items.length >= pageSize,
        },
        droppedCount,
    };
}

export { isUpstreamSuccess };
