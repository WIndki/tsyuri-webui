"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

/**
 * How many records a page of results may prefetch.
 *
 * Each prefetch is a full upstream lookup on the server, because upstream has no detail endpoint and a record is resolved
 * by searching its title. Prefetching every link that scrolled into view therefore issued dozens of lookups per page for
 * records most visitors never open. Two covers the case that actually reads as slow — opening one of the first cards the
 * visitor is looking at — at a bounded cost.
 */
const PREFETCH_LIMIT = 2;

/**
 * Prefetches the first few of a set of links.
 *
 * The links themselves carry `prefetch={false}`, so nothing is fetched unless it is named here.
 *
 * `key` names the set. It changes when a new batch of cards arrives — a different result view, or a page appended by
 * scrolling — and the prefetch then runs again for that batch, so the cards the visitor is about to reach are ready
 * without every card in the list being fetched on sight.
 */
export function usePrefetchFirst(hrefs: string[], key: string): void {
    const router = useRouter();

    useEffect(() => {
        for (const href of hrefs.slice(0, PREFETCH_LIMIT)) router.prefetch(href);
        /*
         * `hrefs` is deliberately not a dependency. It is a fresh array on every render, derived from the page the caller
         * holds, so depending on it would re-prefetch on every state change. `key` changes exactly when the set of links
         * does.
         */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, router]);
}
