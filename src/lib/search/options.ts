/**
 * Filter option tables for the book index.
 *
 * Free of React, `server-only` and environment access, so it can be imported from Server
 * Components, Client Components and tests alike.
 *
 * The `value` literals are the exact strings the upstream endpoint expects. They live in
 * one place because v1 duplicated them between the form UI and the Redux slice, which is
 * how `purity` ended up labelled "B" while holding the value `"5"` — a value that actually
 * widens the result set rather than narrowing it to B-grade books.
 */

/** Sort keys accepted by `sort=`. */
export const SORT_OPTIONS = [
    { value: "last_index_update_time", label: "最近更新" },
    { value: "word_count", label: "字数最多" },
    { value: "click_purity_score", label: "综合推荐" },
    { value: "create_time", label: "最新入库" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

/**
 * Upstream default when `sort` is absent or empty.
 *
 * Note that an *unrecognised* value is not a fallback: it is a hard error
 * (`code: "500"`, `data: null`) delivered with HTTP 200. Validation is therefore not
 * cosmetic — see `parseSearchQuery`.
 */
export const DEFAULT_SORT: SortValue = "last_index_update_time";

/** `bookStatus`: a stringified boolean upstream. */
export const BOOK_STATUS_OPTIONS = [
    { value: "0", label: "连载中" },
    { value: "1", label: "已完结" },
] as const;

/**
 * `purity` — a **cumulative quality threshold**, not a grade selector.
 *
 * This is the single most misunderstood parameter in the API, and v1 mislabelled it as a
 * set of independent grades (offering A+ / A / A- / B with the values 1 / 2 / 3 / 5, and
 * skipping 4 entirely).
 *
 * Measured behaviour of `purity=N`:
 *
 * | N | total | grades actually returned        |
 * |---|-------|---------------------------------|
 * | 1 |  1916 | A+                              |
 * | 2 |  5031 | A+, A                           |
 * | 3 |  6718 | A+, A, A-                       |
 * | 4 |  7854 | A+, A, A-, B+                   |
 * | 5 |  9334 | A+, A, A-, B+, B                |
 *
 * So a *smaller* number is a *stricter* filter, and the sets are nested. The labels below
 * therefore describe "at least this good", which is what the parameter means.
 *
 * The record-level `purity` field holds letter grades (`"A+"`, `"B"`, `"---"`, `""`) — that
 * is a different encoding entirely, and passing one to this parameter is a hard error.
 */
export const PURITY_OPTIONS = [
    { value: "1", label: "A+ 及以上", description: "仅 A+ 评级，约 1,900 本" },
    { value: "2", label: "A 及以上", description: "A+ 与 A，约 5,000 本" },
    { value: "3", label: "A- 及以上", description: "A+ / A / A-，约 6,700 本" },
    { value: "4", label: "B+ 及以上", description: "含 B+，约 7,900 本" },
    { value: "5", label: "B 及以上", description: "含 B，约 9,300 本（最宽松）" },
] as const;

export type PurityValue = (typeof PURITY_OPTIONS)[number]["value"];

/**
 * `updatePeriod` — a lookback window in days.
 *
 * Filters on `lastIndexUpdateTime >= now - N days`. **This is data-dependent, not a fixed
 * menu**: at sampling time the newest `lastIndexUpdateTime` in the entire index was 7 days
 * old, so every window of 1–7 days legitimately returned zero records while `8` returned
 * 579. A short window is therefore a valid filter that can be empty, and the empty state
 * must explain that rather than looking like a bug.
 */
export const UPDATE_PERIOD_OPTIONS = [
    { value: "3", label: "3 天内" },
    { value: "7", label: "7 天内" },
    { value: "30", label: "30 天内" },
    { value: "90", label: "90 天内" },
    { value: "365", label: "一年内" },
] as const;

export type UpdatePeriodValue = (typeof UPDATE_PERIOD_OPTIONS)[number]["value"];

/**
 * `wordCountMin` / `wordCountMax` thresholds.
 *
 * Both bounds are validated upstream as inclusive integers, and subsets partition exactly
 * (`wordCountMin=100000` → 18,213 plus `wordCountMax=100000` → 69,020 sums to the full
 * 87,233). Represented as one shared ladder so the UI can present a range rather than two
 * unrelated radio groups, which is what v1 did.
 */
export const WORD_COUNT_STEPS = [
    { value: "50000", label: "5 万" },
    { value: "150000", label: "15 万" },
    { value: "300000", label: "30 万" },
    { value: "500000", label: "50 万" },
    { value: "1000000", label: "100 万" },
    { value: "2000000", label: "200 万" },
] as const;

export type WordCountStep = (typeof WORD_COUNT_STEPS)[number]["value"];

/**
 * `tag` values offered as quick filters.
 *
 * Only a curated shortlist, not a taxonomy: upstream has no tag-listing endpoint, and
 * comma-joining multiple tags is unreliable (see `parseSearchQuery`), so these are the
 * highest-signal terms for this audience. A free-text tag is intentionally not offered —
 * an unknown tag returns an empty result set with no indication that the tag itself was
 * the problem.
 */
export const TAG_OPTIONS = [
    { value: "百合", label: "百合" },
    { value: "变百", label: "变百" },
    { value: "变身", label: "变身" },
    { value: "性转", label: "性转" },
    { value: "橘味", label: "橘味" },
    { value: "女性主角", label: "女性主角" },
    { value: "纯爱", label: "纯爱" },
    { value: "日常", label: "日常" },
    { value: "异世界", label: "异世界" },
    { value: "恋爱", label: "恋爱" },
] as const;

/**
 * `source` values.
 *
 * These are `crawlSourceName` values. The list is exactly the set observed in the corpus:
 * SF轻小说 (1,331), 刺猬猫 (338), 番茄 (111), 起点 (26), 次元姬 (17) out of 1,823 records.
 * v1 omitted 番茄 even though it is the third-largest source.
 *
 * Upstream accepts exactly one source name per request; any comma-joined form returns zero
 * results even for a single value with a leading comma.
 */
export const SOURCE_OPTIONS = [
    { value: "SF轻小说", label: "SF轻小说" },
    { value: "刺猬猫", label: "刺猬猫" },
    { value: "番茄", label: "番茄" },
    { value: "次元姬", label: "次元姬" },
    { value: "起点", label: "起点" },
] as const;

/**
 * Page sizes offered in the UI.
 *
 * Capped well below the upstream maximum on purpose. Measured cost: ~0.7 s fixed per
 * request plus ~16.5 KB raw / ~5.5 KB gzipped per record, and latency becomes erratic above
 * 500. `limit=1000` ranged from 0.93 s to 30.3 s for identical requests.
 */
export const PAGE_SIZE_OPTIONS = [12, 24, 48, 96] as const;
export const DEFAULT_PAGE_SIZE = 24;

/**
 * Hard bounds enforced before any request reaches upstream.
 *
 * `min: 1` is a safety requirement, not a nicety: **`limit=0` makes upstream serialise the
 * entire table** — 87,233 records, 103 MB, ~163 s — so a single malformed URL could turn
 * into a self-inflicted denial of service, both on upstream and on our cache.
 */
export const PAGE_SIZE_BOUNDS = { min: 1, max: 500 } as const;
export const PAGE_BOUNDS = { min: 1, max: 5000 } as const;

/** Builds a `Set` of the values in an option table, for O(1) validation. */
function valueSet<T extends { value: string }>(options: readonly T[]): ReadonlySet<string> {
    return new Set(options.map((option) => option.value));
}

export const SORT_VALUES = valueSet(SORT_OPTIONS);
export const BOOK_STATUS_VALUES = valueSet(BOOK_STATUS_OPTIONS);
export const PURITY_VALUES = valueSet(PURITY_OPTIONS);
export const UPDATE_PERIOD_VALUES = valueSet(UPDATE_PERIOD_OPTIONS);
export const WORD_COUNT_VALUES = valueSet(WORD_COUNT_STEPS);
export const TAG_VALUES = valueSet(TAG_OPTIONS);
export const SOURCE_VALUES = valueSet(SOURCE_OPTIONS);
