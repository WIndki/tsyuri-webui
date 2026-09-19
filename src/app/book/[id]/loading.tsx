import shimmer from "@/components/book/skeleton-shimmer.module.css";

import styles from "./loading.module.css";

/**
 * Shown while the server resolves a book.
 *
 * Resolving a book means searching the upstream index by title, so this route is the slowest in the
 * application and the one where a placeholder matters most. The layout mirrors the real page — cover
 * beside the facts, then the description panel — with the cover holding the same 3:4 ratio, so the page
 * does not reflow when the record arrives.
 *
 * Every block is a plain element carrying the shared shimmer. antd's `Skeleton` cannot be used here: its
 * parts are compound sub-components, and those are `undefined` in a Server Component, which is what a
 * `loading.tsx` file is.
 */
export default function BookLoading() {
    /*
     * Combines a block's own size with the shared shimmer.
     *
     * The class arguments are `string | undefined` because a CSS module's generated types cannot prove
     * that a class appearing only inside a media query applies. A missing class here means the
     * stylesheet and the markup disagree, so it throws rather than rendering an unsized block that
     * would collapse the placeholder.
     */
    const block = (size: string | undefined): string => {
        if (!size || !shimmer.block) {
            throw new Error("loading.tsx: a placeholder block is missing its class");
        }
        return `${size} ${shimmer.block}`;
    };

    return (
        <div className={styles.page} aria-busy>
            <div className={block(styles.back)} />

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
