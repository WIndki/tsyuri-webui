"use client";

import { useCallback, useTransition } from "react";

import { useRouter } from "next/navigation";

import {
    toSearchHref,
    withPage,
    withPatch,
    type SearchQuery,
} from "./query";

/**
 * Writes search-query changes to the URL.
 *
 * The URL is the single source of truth for search state. That is the central architectural
 * decision of this rewrite: v1 mirrored the query into Redux and pushed to history manually
 * via a listener middleware, so two copies of the same state could — and did — disagree,
 * and the App Router never learned about navigations it had not initiated.
 *
 * Navigation is wrapped in `startTransition` so that React keeps the current results
 * interactive (and shows the pending state) while the server renders the next set, instead
 * of blocking on the round-trip.
 */
export function useSearchNavigation() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const navigate = useCallback(
        (query: SearchQuery, options?: { scroll?: boolean; replace?: boolean }) => {
            const href = toSearchHref(query);
            const replace = options?.replace ?? false;
            const scroll = options?.scroll ?? false;

            startTransition(() => {
                if (replace) router.replace(href, { scroll });
                else router.push(href, { scroll });
            });
        },
        [router],
    );

    /**
     * Applies a filter change.
     *
     * Always resets to page 1, because keeping the current page while the filters change
     * routinely lands past the end of the new result set — which renders as an empty page
     * with no explanation of why.
     */
    const applyPatch = useCallback(
        (query: SearchQuery, patch: Partial<SearchQuery>) => {
            navigate(withPatch(query, patch));
        },
        [navigate],
    );

    /** Moves to a specific page, keeping the filters. */
    const goToPage = useCallback(
        (query: SearchQuery, page: number) => {
            navigate(withPage(query, page), { scroll: true });
        },
        [navigate],
    );

    return { navigate, applyPatch, goToPage, isPending };
}
