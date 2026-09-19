import shimmer from "@/components/book/skeleton-shimmer.module.css";

import styles from "./results-skeleton.module.css";

interface ResultsSkeletonProps {
    /**
     * How many placeholder cards to render.
     *
     * Matches the page size of the request being waited on, so the placeholder occupies the same area as
     * the result that replaces it and nothing below shifts when the data arrives.
     */
    count: number;
}

/**
 * Placeholder cards for a page of results that is still being fetched.
 *
 * Built from plain elements carrying the shared shimmer, rather than from antd's `Skeleton`, because
 * this component is rendered by route-level `loading.tsx` as well as by the client island. A Server
 * Component cannot reach antd's compound sub-components (`Skeleton.Node`, `Skeleton.Image`), and mixing
 * two implementations would mean the placeholder looked different depending on which path rendered it.
 *
 * Every block states its own size, matching `book-card.module.css`. The composed antd skeleton sizes its
 * rows from its own defaults, which do not line up with a card, so the placeholder would be a different
 * height from the card replacing it and the page would shift at the moment the visitor starts reading.
 */
export function ResultsSkeleton({ count }: ResultsSkeletonProps) {
    /*
     * Combines a block's own size with the shared shimmer.
     *
     * The class arguments are `string | undefined` because a CSS module's generated types cannot prove
     * that a class appearing only inside a media query applies. A missing class here means the stylesheet
     * and the markup disagree, so it throws rather than rendering an unsized block that would collapse
     * the placeholder and shift the page when the results arrive.
     */
    const block = (size: string | undefined): string => {
        if (!size || !shimmer.block) {
            throw new Error("ResultsSkeleton: a placeholder block is missing its class");
        }
        return `${size} ${shimmer.block}`;
    };

    return (
        <div className={styles.grid} aria-hidden>
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className={styles.card}>
                    <div className={block(styles.cover)} />

                    <div className={styles.body}>
                        <div className={block(styles.title)} />
                        <div className={block(styles.author)} />

                        <div className={styles.tags}>
                            <div className={block(styles.tag)} />
                            <div className={block(styles.tag)} />
                        </div>

                        <div className={block(styles.summary)} />
                        <div className={block(styles.footer)} />
                    </div>
                </div>
            ))}
        </div>
    );
}
