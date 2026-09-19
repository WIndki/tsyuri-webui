import { ResultsSkeleton } from "@/components/book/results-skeleton";
import { DEFAULT_PAGE_SIZE } from "@/lib/search/options";

import styles from "./loading.module.css";

/**
 * Shown while the server renders a search page.
 *
 * This is what a visitor sees when they open a link, follow a shared URL, or press back: the request to
 * the upstream index has not been issued yet, and without a placeholder the page would be blank for the
 * whole round-trip.
 *
 * The layout mirrors the real page in order — search field, filter panel, heading, grid — and each block
 * is the size of the thing that replaces it, so nothing moves when the results arrive. That is why the
 * panel's height here accounts for the collapsed panel, not the expanded one: the real page renders it
 * collapsed first.
 */
export default function SearchLoading() {
    return (
        <div className={styles.page} aria-busy>
            <div className={`${styles.searchBar} ${styles.block}`} />
            <div className={`${styles.panel} ${styles.block}`} />

            <div className={styles.summary}>
                <div className={`${styles.heading} ${styles.block}`} />
                <div className={`${styles.count} ${styles.block}`} />
            </div>

            <ResultsSkeleton count={DEFAULT_PAGE_SIZE} />
        </div>
    );
}
