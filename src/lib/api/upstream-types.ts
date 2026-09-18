/**
 * Empirically verified type contract for the upstream tsyuri book index.
 *
 * Every annotation below was established by sampling a 1,823-record corpus across all four
 * sort modes, multiple pages, and every filter parameter — see `docs/upstream-api.md` for
 * the raw evidence and reproduction commands.
 *
 * This replaces v1's `Book` interface, which was materially wrong: it declared
 * `userTag: string` while the API returns `null` in 95% of records, and declared
 * `newTag`/`tag` as independent fields when they are byte-identical in 100% of records.
 *
 * ## Rules encoded here
 *
 * - **Every key is always present.** All 32 keys appeared in 100% of sampled records, so
 *   no property is optional. The only axis of variation is `null` vs. a value. This is why
 *   fields that were *always* `null` are typed as the literal `null` rather than
 *   `string | null`: it turns "read a dead column" into a compile error.
 * - **`data` is `null` on every failure**, and failures arrive as **HTTP 200**. A caller
 *   that checks `response.ok` and then reads `data.list` will throw.
 * - **Numbers are strings.** `pageNum`, `pageSize`, `total` and `wordCount` are all
 *   stringified; they must be parsed before use.
 */

/**
 * The upstream content-purity grade, as it appears in a *record*.
 *
 * Observed: `"" | "A+" | "A" | "A-" | "B" | "B+" | "-" | "--" | "---"`.
 * `""` is the single most common value (~76% of records).
 *
 * Do not confuse this with the `purity` *query parameter*, which takes an integer 1–5 as
 * a cumulative quality threshold. Passing a letter grade to the query parameter is a hard
 * error (`code: "500"`).
 */
export type PurityGrade = string;

/** `bookStatus` is a stringified boolean. Only `"0"` and `"1"` were ever observed. */
export type BookStatus = "0" | "1";

/** A book record as returned by `GET /book/searchByPage`. */
export interface UpstreamBook {
    // ── Always present, never null, never empty ─────────────────────────────────
    id: string;
    /**
     * Two shapes only, both usable verbatim:
     *   "/localPic/2021/04/05/<uuid>.jpg"      → index-hosted mirror
     *   "https://rss.sfacg.com/web/novel/..."  → third-party CDN
     * 558 relative vs. 1,265 absolute out of 1,823 sampled.
     */
    picUrl: string;
    bookName: string;
    authorName: string;
    /** `"YYYY-MM-DD HH:mm:ss"`, no timezone. See `parseUpstreamDate`. */
    lastIndexUpdateTime: string;
    /** `"SF轻小说" | "刺猬猫" | "番茄" | "起点" | "次元姬"` in practice. */
    crawlSourceName: string;
    /** Comma-joined CSV. Duplicates within the field are common. `""` in rare records. */
    tag: string;
    /** Byte-identical to `tag` in 100% of 1,823 sampled records. */
    newTag: string;
    /** Stringified integer. */
    wordCount: string;
    purity: PurityGrade;
    bookStatus: BookStatus;

    // ── Genuinely nullable ─────────────────────────────────────────────────────
    /** `null` for 刺猬猫 / 番茄 / 起点 records (~6% overall). */
    catId: string | null;
    /** `null` for 刺猬猫 / 番茄 / 起点 records (~26% overall). */
    catName: string | null;
    /** `null` for 刺猬猫 / 起点 records (~20% overall). */
    authorId: string | null;
    /** `null` in 1 record and `""` in 2, out of 1,823. */
    bookDesc: string | null;
    /**
     * Sparse: non-null in ~5% of records.
     *
     * The v1 type declared this as non-nullable `string`, which type-checked cleanly and
     * would have thrown at runtime on the other 95%.
     */
    userTag: string | null;

    // ── Present but populated only via a code path that could not be reproduced ──
    /**
     * `null` in all 1,823 sampled records across 30+ calls, but was observed populated on
     * one call early in the investigation and could not be triggered again. Typed nullable
     * rather than `null` so that a future backfill does not become a silent truncation.
     */
    lastIndexId: string | null;
    lastIndexName: string | null;

    // ── Always null in every sampled record (dead columns) ─────────────────────
    workDirection: null;
    picUrlLocal: null;
    score: null;
    visitCount: null;
    commentCount: null;
    yesterdayBuy: null;
    isVip: null;
    status: null;
    updateTime: null;
    createTime: null;
    crawlSourceId: null;
    crawlBookId: null;
    crawlLastTime: null;
    crawlIsStop: null;
}

/** Pagination block of the upstream envelope. All three scalars are strings. */
export interface UpstreamPageData {
    /** Echoes `curr` verbatim, including nonsensical values like `"0"` or `"-1"`. */
    pageNum: string;
    /** Echoes `limit` verbatim, including `"0"` and negative values. */
    pageSize: string;
    /**
     * **Display estimate only.**
     *
     * Not reliably the number of pageable rows: for `tag=百合` it reports `"18030"`, yet
     * paging yielded 2,000 distinct records with no duplicates and then ran dry. Comma
     * prefixes perturb it further (`tag=百合` → 18030, `tag=%2C百合` → 17864, for an
     * *identical* ID set). Never use it to decide whether a next page exists.
     */
    total: string;
    /** `[]` for both an empty result set and a page past the end. Never `null`. */
    list: UpstreamBook[];
}

/**
 * The upstream response envelope.
 *
 * **HTTP status is always 200, including for server errors.** A request with an
 * unsupported `sort`, a non-integer `limit`, or a letter-grade `purity` returns HTTP 200
 * with `{"code":"500","msg":"未知异常，请联系管理员！","data":null}`.
 *
 * Only framework-level problems use a real status: `406` for an `Accept` that excludes
 * JSON, `405` for non-GET methods, `403` for `OPTIONS`, `400` for raw unencoded UTF-8 in
 * the query string, `404` for an unknown path.
 */
export interface UpstreamEnvelope {
    /** `"200"` on success, `"400"` for invalid parameters, `"500"` for coercion failures. */
    code: string;
    /** `"SUCCESS"` | `"非法参数！"` | `"未知异常，请联系管理员！"` */
    msg: string;
    data: UpstreamPageData | null;
}

/** `code` values that mean success. */
export const UPSTREAM_OK_CODES: ReadonlySet<string> = new Set(["200", "0"]);

export function isUpstreamSuccess(
    envelope: UpstreamEnvelope,
): envelope is UpstreamEnvelope & { data: UpstreamPageData } {
    return UPSTREAM_OK_CODES.has(envelope.code) && envelope.data !== null;
}
