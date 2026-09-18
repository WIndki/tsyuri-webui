/**
 * Display-mode preference: which presentation the visitor last chose.
 *
 * The *current* mode lives in the URL (`?display=`), because the two modes render different
 * documents and the server has to know which one to build. This module only remembers the choice so
 * a returning visitor can be sent to their preferred mode on first load.
 *
 * `localStorage` is unreachable from a Server Component, so the stored value is read by a client
 * island on `/`, which redirects. That keeps the preference a convenience rather than something the
 * rendering depends on.
 */

export type DisplayMode = "infinite" | "pagination";

export const DISPLAY_MODE_STORAGE_KEY = "tsyuri.displayMode";

/** Default for a visitor with no stored preference and a non-iOS user agent. */
export const DEFAULT_DISPLAY_MODE: DisplayMode = "infinite";

export function isDisplayMode(value: unknown): value is DisplayMode {
    return value === "infinite" || value === "pagination";
}

/**
 * The mode a visitor without a stored preference should get.
 *
 * iOS Safari miscounts scroll restoration on a list that grows as the visitor scrolls, which makes
 * infinite scrolling lose their place on a back navigation. Pagination avoids that.
 */
export function preferredDisplayMode(userAgent: string): DisplayMode {
    if (/iPad|iPhone|iPod/.test(userAgent)) return "pagination";
    return DEFAULT_DISPLAY_MODE;
}

/** Reads the stored preference, tolerating disabled storage. */
export function storedDisplayMode(): DisplayMode | null {
    try {
        const value = localStorage.getItem(DISPLAY_MODE_STORAGE_KEY);
        return isDisplayMode(value) ? value : null;
    } catch {
        return null;
    }
}

export function storeDisplayMode(mode: DisplayMode): void {
    try {
        localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, mode);
    } catch {
        // Persistence is best-effort; private browsing can reject writes.
    }
}
