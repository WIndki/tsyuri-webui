"use client";

import { useCallback } from "react";

import { useRouter } from "next/navigation";

import styles from "./back-link.module.css";

interface BackLinkProps {
    /** Where to go when there is no in-app history to return to. */
    href: string;
    label?: string;
}

/**
 * A back control that preserves the visitor's position in the result list.
 *
 * A Client Component because it consults the history stack. Going back through history restores
 * the previous scroll offset as well as the URL, which matters here: a visitor who opened the
 * fourteenth book on page three should return to the fourteenth book, and a plain link to
 * `/search` would drop them at the top of an unfiltered page.
 *
 * The fallback `href` is a real link, so the control works with JavaScript disabled and is
 * crawlable.
 */
export function BackLink({ href, label = "返回结果" }: BackLinkProps) {
    const router = useRouter();

    const handleClick = useCallback(() => {
        // `history.length > 1` means this tab navigated here rather than opening the URL directly.
        if (window.history.length > 1) router.back();
        else router.push(href);
    }, [router, href]);

    return (
        <button type="button" className={styles.link} onClick={handleClick}>
            <span aria-hidden className={styles.arrow}>
                ←
            </span>
            {label}
        </button>
    );
}
