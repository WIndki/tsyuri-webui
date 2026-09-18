/**
 * The theme preference.
 *
 * Stored in `localStorage` and mirrored onto a document attribute so CSS can react without
 * JavaScript. The *initial* read happens in the inline bootstrap script (see `bootstrap-script.ts`),
 * which runs before first paint; `useThemeMode` then reads the resulting attribute back, so the
 * first client render already agrees with the DOM and there is neither a hydration mismatch nor a
 * second paint.
 *
 * The result-list display mode is deliberately not here: it changes which document the server
 * builds, so it lives in the URL. See `display-mode.ts`.
 */

export const THEME_STORAGE_KEY = "tsyuri.theme";

/** Document attribute written by the bootstrap script. */
export const THEME_ATTRIBUTE = "data-theme";

/**
 * Event dispatched on `window` whenever the theme changes.
 *
 * A DOM event rather than React context, so that toggling the theme re-renders only the provider
 * that re-themes antd and the control that changed it.
 */
export const PREFERENCE_CHANGE_EVENT = "tsyuri:preferencechange";

export type ThemeMode = "light" | "dark";

export const DEFAULT_THEME_MODE: ThemeMode = "light";

/**
 * Brand primary per mode.
 *
 * A single value does not work across both surfaces: `#1677ff` meets contrast targets on white but
 * reads muddy on near-black, so dark mode uses a lighter, less saturated blue.
 */
export const BRAND = {
    light: "#1677ff",
    dark: "#3c9ae8",
} as const;

export function isThemeMode(value: unknown): value is ThemeMode {
    return value === "light" || value === "dark";
}

/** Writes a value to `localStorage`, tolerating disabled storage. */
function writeStored(key: string, value: string): void {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Persistence is best-effort; the value is already applied to this session.
    }
}

/**
 * Reads the theme the bootstrap script already committed to the DOM.
 *
 * Deliberately not a `localStorage` read: the attribute is the single observable source of truth
 * for "what is currently rendered", and reading it cannot disagree with the paint.
 */
export function readAppliedTheme(): ThemeMode {
    if (typeof document === "undefined") return DEFAULT_THEME_MODE;
    const value = document.documentElement.getAttribute(THEME_ATTRIBUTE);
    return isThemeMode(value) ? value : DEFAULT_THEME_MODE;
}

/** Applies and persists the theme. */
export function applyTheme(mode: ThemeMode): void {
    const root = document.documentElement;
    root.setAttribute(THEME_ATTRIBUTE, mode);
    // Keeps form controls, scrollbars and the like in the matching scheme.
    root.style.colorScheme = mode;

    writeStored(THEME_STORAGE_KEY, mode);
    window.dispatchEvent(new Event(PREFERENCE_CHANGE_EVENT));
}
