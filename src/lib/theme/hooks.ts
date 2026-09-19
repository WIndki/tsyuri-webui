"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
    DEFAULT_THEME_MODE,
    PREFERENCE_CHANGE_EVENT,
    applyTheme,
    readAppliedTheme,
    type ThemeMode,
} from "./preferences";
import { revealThemeChange } from "./view-transition";

/**
 * The theme, built on `useSyncExternalStore`.
 *
 * The value lives in the DOM — written by the inline bootstrap script before first paint and mutated
 * by the toggle — which makes it an *external store*, exactly what `useSyncExternalStore` is for.
 * This matters for two reasons:
 *
 * 1. **No hydration mismatch, and no setState-in-effect.** The third `getServerSnapshot` argument is
 *    used for the server render *and* for the hydration render, then React swaps to `getSnapshot`. So
 *    the client's first render always agrees with the server markup, and the correction happens as
 *    part of hydration rather than as a cascading second render.
 * 2. **One subscription for the whole app.** Components that read the theme re-render only when it
 *    changes, not on every context update.
 *
 * The result-list display mode is not a preference hook: it lives in the URL, because the server has
 * to know it in order to render the correct document.
 */

function subscribe(onStoreChange: () => void): () => void {
    window.addEventListener(PREFERENCE_CHANGE_EVENT, onStoreChange);
    return () => window.removeEventListener(PREFERENCE_CHANGE_EVENT, onStoreChange);
}

/**
 * Reads the applied theme, or `null` when the bootstrap script has not run.
 *
 * A single stable value rather than a freshly built object, because `getSnapshot` must return a
 * referentially stable result between changes or React re-renders indefinitely.
 */
function getThemeSnapshot(): ThemeMode | null {
    if (typeof document === "undefined") return null;
    return readAppliedTheme();
}

/** The server cannot know the visitor's preference, so it reports it as unresolved. */
function getServerThemeSnapshot(): ThemeMode | null {
    return null;
}

export function useThemeMode(): {
    mode: ThemeMode;
    resolved: boolean;
    /**
     * Switches the theme, revealing the change as a circle from the pressed control.
     *
     * Takes the control itself, because the reveal has to start where the press happened. Passing the element rather
     * than a coordinate keeps the measurement inside the effect.
     */
    toggleTheme: (origin?: Element | null) => void;
} {
    const mode = useSyncExternalStore(subscribe, getThemeSnapshot, getServerThemeSnapshot);

    const toggleTheme = useCallback((origin?: Element | null) => {
        revealThemeChange(origin ?? null, () => {
            /*
             * Read from the DOM rather than from the rendered value, so a rapid second press cannot act on a stale
             * value from the frame before the re-render.
             */
            applyTheme(readAppliedTheme() === "dark" ? "light" : "dark");
        });
    }, []);

    return { mode: mode ?? DEFAULT_THEME_MODE, resolved: mode !== null, toggleTheme };
}
