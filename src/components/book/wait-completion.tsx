"use client";

import { useEffect } from "react";

import { toSearchParams, type SearchQuery } from "@/lib/search/query";
import { useUiStore } from "@/lib/search/ui-store";

/**
 * Ends a wait when its answer has been rendered.
 *
 * Mounted unconditionally by the search page, so the wait ends for every outcome. `ResultsIsland` reports completion too,
 * but it is only mounted when the server render contains books: a query that matches nothing, and a page past the end of
 * the reachable results, both render an empty list. Left to the island, those outcomes would never end the wait and the
 * search button would keep spinning with a skeleton on screen.
 *
 * `queryKey` is the dependency rather than the payload. A change of query is exactly the navigation, and the store ignores
 * a report while no wait is outstanding, so the router's own re-render of the new URL — which happens tens of milliseconds
 * after the click, from the payload that was already there — cannot end a wait early. The delay inside the store is what
 * decides whether a skeleton was warranted, and it treats that early render as "a payload arrived" only for that purpose.
 *
 * The proposals are dropped here for the same reason they exist: they let a control show a choice the server has not
 * confirmed, and once the answer is on screen the committed query carries the choice.
 */
export function WaitCompletion({ query }: { query: SearchQuery }) {
    const queryKey = toSearchParams(query).toString();
    const endWait = useUiStore((state) => state.endWait);
    const clearProposed = useUiStore((state) => state.clearProposed);

    useEffect(() => {
        endWait();
        clearProposed();
    }, [queryKey, endWait, clearProposed]);

    return null;
}
