/**
 * The inline theme bootstrap script.
 *
 * This is the standard blocking-script pattern for avoiding a flash of the wrong theme. v1 read
 * `localStorage` inside a React `useEffect`, which runs *after* the first paint, so a dark-mode
 * visitor reliably saw a white flash on every load.
 *
 * The script must be inlined verbatim into `<head>`, ahead of any stylesheet-driven paint, so it
 * cannot import anything at runtime. The storage key is interpolated at build time from the shared
 * module instead, so renaming it cannot silently break the bootstrap.
 *
 * The result-list display mode is not handled here: it travels in the URL, so the server already
 * knows it and there is nothing to correct before paint.
 */

import { DEFAULT_THEME_MODE, THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "./preferences";

export const THEME_BOOTSTRAP_SCRIPT = `
(function () {
    var root = document.documentElement;

    var theme;
    try {
        theme = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    } catch (error) {
        // localStorage throws in some private-browsing and sandboxed-iframe contexts.
        theme = null;
    }

    if (theme !== "dark" && theme !== "light") {
        // No explicit choice yet: honour the OS preference.
        theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : ${JSON.stringify(DEFAULT_THEME_MODE)};
    }

    root.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)}, theme);
    root.style.colorScheme = theme;
})();
`.trim();
