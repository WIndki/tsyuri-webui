/**
 * Date, number and text helpers.
 *
 * Kept free of React and of environment access so they run unchanged on the server, in the
 * browser and in tests. v1 scattered `parseInt` / `new Date(...)` / `toFixed` calls across
 * component hooks, which is how the same value ended up formatted two slightly different
 * ways depending on which component rendered it.
 */

/**
 * Parses the upstream timestamp format `"YYYY-MM-DD HH:mm:ss"` into epoch milliseconds.
 *
 * That format carries **no timezone**, and `new Date("2026-09-11 17:30:13")` is
 * implementation-defined — V8 reads it as local time, other engines reject it. We parse
 * the components explicitly and treat the value as UTC+8, which is correct for the index
 * and all of its sources. The result is therefore deterministic regardless of where the
 * server or the visitor happens to be, which is what makes it safe to render during SSR.
 *
 * Returns a number rather than a `Date` so the value survives `JSON.stringify`, which is what
 * `unstable_cache` applies to everything the data layer returns.
 */
const UPSTREAM_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/;

const CHINA_OFFSET_MINUTES = 8 * 60;

export function parseUpstreamEpochMs(value: string | null | undefined): number | null {
    if (!value) return null;

    const match = UPSTREAM_DATE_PATTERN.exec(value.trim());
    if (!match) return null;

    const [, year, month, day, hour, minute, second] = match;
    const utcMillis = Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
    );

    if (Number.isNaN(utcMillis)) return null;

    return utcMillis - CHINA_OFFSET_MINUTES * 60_000;
}

/**
 * Formats epoch milliseconds as a coarse relative label ("3天前").
 *
 * Deliberately coarse: a novel index does not need second-level precision, and coarse
 * labels are *stable*, which keeps them safe to render during SSR. A minutes-precision
 * label would differ between the server render and hydration and produce a mismatch.
 * `now` is injectable so the output is testable and callers can pin it per request.
 */
export function formatRelativeDate(
    epochMs: number | null | undefined,
    now: number,
): string {
    if (epochMs === null || epochMs === undefined) return "未知";

    const diffMs = now - epochMs;

    // A future timestamp means clock skew somewhere upstream; say "刚刚" rather than
    // rendering a nonsensical negative age.
    if (diffMs < 0) return "刚刚";

    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}天前`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}个月前`;

    return `${Math.floor(months / 12)}年前`;
}

/** Absolute timestamp for a `title` attribute, in the visitor's locale. */
export function formatAbsoluteDate(epochMs: number | null | undefined): string {
    if (epochMs === null || epochMs === undefined) return "";
    return new Date(epochMs).toLocaleString("zh-CN");
}

/** `"226937"` → `"22.7万字"`. Returns `"未知"` for unparseable input. */
export function formatWordCount(raw: string | number | null | undefined): string {
    const count = typeof raw === "number" ? raw : Number.parseInt(raw ?? "", 10);
    if (!Number.isFinite(count) || count < 0) return "未知";

    if (count >= 100_000_000) return `${(count / 100_000_000).toFixed(1)}亿字`;
    if (count >= 10_000) return `${(count / 10_000).toFixed(1)}万字`;
    return `${count}字`;
}

/**
 * Truncates to a number of characters, counting code points.
 *
 * Counting code points rather than UTF-16 code units is what keeps a surrogate pair intact. Slicing by code unit can cut
 * an emoji in half and leave a lone surrogate, and a lone surrogate is not a character: `encodeURIComponent` throws on
 * one, so a truncated value that reaches a URL can take down the route that builds it.
 */
export function truncate(value: string, max: number): string {
    const trimmed = value.trim();
    const characters = Array.from(trimmed);
    if (characters.length <= max) return trimmed;
    return `${characters.slice(0, max).join("").trimEnd()}…`;
}

/**
 * Splits comma-joined tag fields into a clean list.
 *
 * The upstream data contains duplicates (the same keyword frequently appears twice inside
 * one field), empty segments and inconsistent whitespace. Normalising here means components
 * never render the same tag twice — which was both a visible v1 defect and a React key
 * collision.
 */
export function parseTags(...fields: (string | null | undefined)[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const field of fields) {
        if (!field) continue;

        for (const piece of field.split(/[,，]/)) {
            const tag = piece.trim();
            if (!tag || seen.has(tag)) continue;
            seen.add(tag);
            result.push(tag);
        }
    }

    return result;
}

/** Collapses runs of whitespace so a trimmed description still has sane paragraphing. */
export function normalizeWhitespace(value: string): string {
    return value
        .replace(/\r\n?/g, "\n")
        .replace(/[ \t\u00a0]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
