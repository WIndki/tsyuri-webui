"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import {
    preferredDisplayMode,
    storedDisplayMode,
    type DisplayMode,
} from "@/lib/theme/display-mode";

/**
 * Applies a returning visitor's stored display-mode preference on the landing page.
 *
 * The current mode lives in the URL because the server has to know it in order to render the correct
 * document. That leaves one case unhandled: a visitor's very first request carries no `display`
 * parameter, so the server renders the default mode even if this browser previously chose the other
 * one.
 *
 * This component closes that gap by redirecting once, on the landing page only. It renders nothing,
 * and it never runs when a `display` parameter is already present, so a shared link or a back
 * navigation is never rewritten.
 *
 * iOS Safari is handled here too: it miscounts scroll restoration on a list that grows as the visitor
 * scrolls, which makes infinite scrolling lose their place on a back navigation, so those visitors
 * start in pagination mode.
 */
export function DisplayModePreference() {
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has("display")) return;

        const preferred: DisplayMode =
            storedDisplayMode() ?? preferredDisplayMode(navigator.userAgent);

        // The default needs no parameter, so only a non-default preference redirects.
        if (preferred === "infinite") return;

        params.set("display", preferred);
        // `replace` so the redirect does not become an extra history entry the visitor has to
        // navigate back through.
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    }, [router]);

    return null;
}
