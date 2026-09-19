"use client";

import { useCallback } from "react";

import { useRouter } from "next/navigation";

import { toSearchHref, withPage, withPatch, type SearchQuery } from "./query";
import { useUiStore } from "./ui-store";

/**
 * Writes search-query changes to the URL.
 *
 * The URL is the single source of truth for search state. v1 mirrored the query into Redux and pushed to
 * history manually through a listener middleware, so two copies of the same state could disagree, and the
 * App Router never learned about navigations it had not initiated.
 *
 * Two things happen before the router is touched, because the ordering is what makes the interface feel
 * immediate:
 *
 * 1. The requested facet values are recorded as proposals, so the control the visitor just used shows the
 *    new choice on the next frame instead of after the round-trip.
 * 2. The wait is announced, so the results area can replace the previous result set with a skeleton.
 *
 * `router.push` is **not** wrapped in `startTransition`. It already runs inside a React transition
 * internally, and nesting a second one makes the outer transition supersede the inner: the render that
 * finally carries the server payload is then discarded as interrupted, so the component never sees its own
 * response. That is what left a skeleton on screen with no way to end it.
 */
export function useSearchNavigation() {
    const router = useRouter();

    const navigate = useCallback(
        (query: SearchQuery, options?: { scroll?: boolean; replace?: boolean }) => {
            const href = toSearchHref(query);
            const scroll = options?.scroll ?? false;

            useUiStore.getState().beginWait(query.pageSize);

            if (options?.replace) router.replace(href, { scroll });
            else router.push(href, { scroll });
        },
        [router],
    );

    /**
     * Applies a facet change.
     *
     * Resets to page 1, because keeping the current page while the facets change routinely lands past the end of
     * the new result set, which renders as an empty page with no explanation.
     *
     * The patch is proposed before navigating, so the control can render the chosen value without waiting for the
     * server. The store update lands within the transition that `router.push` starts.
     *
     * Measured: antd's controls already provide the feedback that matters without this — the segmented thumb and
     * the checkbox state move within a frame of the click, because antd animates them from its own value. What
     * waits for the server is the selected styling derived from `value`. Forcing that to change first was tried
     * with a synchronous render and made no visible difference, so it was removed rather than kept for nothing.
     */
    const applyPatch = useCallback(
        (query: SearchQuery, patch: Partial<SearchQuery>) => {
            useUiStore.getState().propose(patch as Record<string, string | undefined>);
            navigate(withPatch(query, patch));
        },
        [navigate],
    );

    /** Moves to a specific page, keeping the facets. */
    const goToPage = useCallback(
        (query: SearchQuery, page: number) => {
            navigate(withPage(query, page), { scroll: true });
        },
        [navigate],
    );

    return { navigate, applyPatch, goToPage };
}
