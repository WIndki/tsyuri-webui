import shimmer from "@/components/book/skeleton-shimmer.module.css";

import styles from "./book-detail-skeleton.module.css";

/**
 * The record's shape, before the record arrives.
 *
 * Resolving a book means searching the upstream index by title, which is the slowest read in the application, so this
 * is the placeholder that is seen most. The layout mirrors the real one — cover beside the facts, then the
 * description panel — with the cover holding the same 3:4 ratio, so nothing moves when the record lands.
 *
 * Shared by the page's `loading.tsx` and the modal branch's, so the two cannot show different shapes for the same
 * wait.
 *
 * Every block is a plain element carrying the shared shimmer. antd's `Skeleton` cannot be used: its parts are
 * compound sub-components, and those are `undefined` in a Server Component, which is what a `loading.tsx` file is.
 */
export function BookDetailSkeleton({ leading = true }: { leading?: boolean }) {
    /*
     * Combines a block's own size with the shared shimmer.
     *
     * The class arguments are `string | undefined` because a CSS module's generated types cannot prove that a class
     * appearing only inside a media query applies. A missing class means the stylesheet and the markup disagree, so
     * it throws rather than rendering an unsized block that would collapse the placeholder.
     */
    const block = (size: string | undefined): string => {
        if (!size || !shimmer.block) {
            throw new Error("BookDetailSkeleton: a placeholder block is missing its class");
        }
        return `${size} ${shimmer.block}`;
    };

    return (
        /*
         * `data-placeholder` names which placeholder this is.
         *
         * The results grid shows placeholders too, and both regions are `aria-busy`, so a check that only looked for
         * a busy region could not tell the record's placeholder from the list's.
         */
        <div className={styles.page} aria-busy data-placeholder="book-detail">
            {/* The page has a back link above the record; the modal does not. */}
            {leading ? <div className={block(styles.back)} /> : null}

            <div className={styles.layout}>
                <div className={block(styles.cover)} />

                <div className={styles.info}>
                    <div className={block(styles.title)} />
                    <div className={block(styles.author)} />

                    <div className={styles.tags}>
                        <div className={block(styles.tag)} />
                        <div className={block(styles.tag)} />
                        <div className={block(styles.tag)} />
                    </div>

                    <div className={styles.meta}>
                        {Array.from({ length: 4 }, (_, index) => (
                            <div key={index} className={styles.metaRow}>
                                <div className={block(styles.metaLabel)} />
                                <div className={block(styles.metaValue)} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.description}>
                <div className={block(styles.sectionHeading)} />
                {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className={block(styles.line)} />
                ))}
            </div>
        </div>
    );
}
