"use client";

import { useSearchParams } from "next/navigation";

import { SearchBar } from "@/components/search/search-bar";
import { SearchPanel } from "@/components/search/search-panel";
import { parseSearchQuery, type RawSearchParams } from "@/lib/search/query";

import styles from "./bottom-panel.module.css";

/**
 * The search and facet controls, anchored to the bottom of the viewport.
 *
 * ## Why the bottom
 *
 * These controls are what the interface is for, and the results grid is what they act on. Anchoring them to the
 * bottom keeps them within reach of a thumb on a phone, and leaves the top of the screen to the results — which
 * matters here because a result is a cover image, and covers are what a reader scans.
 *
 * ## Why the document is padded rather than the panel floated over the list
 *
 * A fixed panel covers whatever is beneath it, and what is beneath it at the end of a long list is the "load
 * more" control and its spinner. The panel measures itself and publishes its height as `--panel-height`; the
 * page reserves exactly that much space, so the end of the list scrolls clear of the panel instead of hiding
 * behind it. See `app-shell.module.css`.
 *
 * ## Why it reads the query here rather than taking it as a prop
 *
 * The panel is mounted once by the application shell so that it stays in place across navigations, which means
 * it has no page to receive props from. `useSearchParams` gives it the committed query, and `parseSearchQuery`
 * validates it exactly as the page does, so the controls cannot disagree with the results they describe.
 */
export function BottomPanel() {
    const searchParams = useSearchParams();
    const query = parseSearchQuery(
        Object.fromEntries(searchParams.entries()) as RawSearchParams,
    );

    return (
        <div className={styles.dock} data-bottom-panel="">
            <div className={styles.panel}>
                <SearchBar query={query} />
                <SearchPanel query={query} />
            </div>
        </div>
    );
}
