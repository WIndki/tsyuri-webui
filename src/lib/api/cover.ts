/**
 * Cover URL resolution.
 *
 * Upstream mixes two shapes into the same field, within the same result page:
 *
 *   "https://e1.kuangxiangit.com/uploads/..."   (≈69%)  absolute third-party CDN
 *   "/localPic/2021/08/02/342e....jpg"          (≈31%)  root-relative, index-hosted mirror
 *
 * The relative form is only meaningful on the index's own origin, so it has to be
 * absolutely qualified before a browser or `next/image` can use it. v1 relied on the
 * browser resolving it against *our* origin and then proxied `/localPic/*` back out through
 * `middleware.ts`; that works, but it makes every relative cover depend on our own
 * middleware being deployed and hides the real host from the image optimiser.
 *
 * Resolving here means the rest of the app handles exactly one shape.
 *
 * `/localPic/` is **not** a proxy for the third-party hosts — it is an independent mirror
 * that already replaces the foreign URL for the books it has. Both shapes must be
 * supported. It also returns `HTTP 200` with a zero-byte body for a missing file rather
 * than `404`, so a status check cannot detect a broken cover; the placeholder fallback
 * below covers only the cases detectable from the URL itself.
 */

import { UPSTREAM_ORIGIN } from "./upstream";

/** Used when a record has no usable cover. Served from `/public`. */
export const COVER_PLACEHOLDER = "/images/book-placeholder.jpg";

/** Prefix upstream uses for the covers it mirrors itself. */
const LOCAL_PIC_PREFIX = "/localPic/";

export function resolveCoverUrl(picUrl: string | null | undefined): string {
    const raw = picUrl?.trim();
    if (!raw) return COVER_PLACEHOLDER;

    // Protocol-relative (`//host/path`) is valid in a URL even though it was not observed in
    // the payload; normalize it rather than letting it resolve against our own origin.
    if (raw.startsWith("//")) return `https:${raw}`;

    if (raw.startsWith(LOCAL_PIC_PREFIX)) return `${UPSTREAM_ORIGIN}${raw}`;

    if (/^https?:\/\//i.test(raw)) return raw;

    // Not a URL we can use — better a placeholder than a broken image.
    return COVER_PLACEHOLDER;
}
