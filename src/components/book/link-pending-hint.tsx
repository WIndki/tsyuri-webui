"use client";

import { useLinkStatus } from "next/link";

import styles from "./link-pending-hint.module.css";

/**
 * A progress line across the top of a card whose detail page is being fetched.
 *
 * Must be rendered inside a `<Link>`, because `useLinkStatus` reads the pending state of the link it is
 * nested in. Next.js prefetches a `<Link>` once it scrolls into view, so the pending phase is usually
 * skipped and this never becomes visible; it appears when prefetching has not finished, which is
 * exactly the case where a click would otherwise look ignored.
 *
 * The element is always rendered and only its opacity changes. Inserting it on demand would shift the
 * card contents at the moment of the click.
 */
export function LinkPendingHint() {
    const { pending } = useLinkStatus();

    return (
        <span
            aria-hidden
            className={pending ? `${styles.hint} ${styles.active}` : styles.hint}
        />
    );
}
