import { hasActiveFilters, type SearchQuery } from "@/lib/search/query";

import styles from "./empty-results.module.css";

interface EmptyResultsProps {
    query: SearchQuery;
    /** Optional reset target; rendered as a plain link so this stays a Server Component. */
    resetHref?: string;
}

/**
 * Shown when a search returns nothing.
 *
 * A Server Component, so it is built from plain HTML/CSS rather than antd's `Empty`. That is
 * not a stylistic preference: `Empty.PRESENTED_IMAGE_SIMPLE` and `Typography.*` are compound
 * sub-components, which a Server Component cannot reach (verified by probing the exports during
 * a server render — see `docs/refactor-plan.md`). Only antd's top-level exports are available
 * server-side.
 *
 * The message branches on whether filters were applied, because the two situations have
 * different causes and one of them is an upstream quirk worth naming explicitly.
 */
export function EmptyResults({ query, resetHref = "/search" }: EmptyResultsProps) {
    const filtering = hasActiveFilters(query);

    return (
        <div className={styles.empty} role="status">
            <p className={styles.title}>
                {filtering ? "没有符合条件的小说" : "索引中没有可显示的小说"}
            </p>

            <p className={styles.hint}>
                {query.updatePeriod ? (
                    <>
                        「更新」按最近更新时间筛选。若索引近期没有抓取到新章节，该条件会返回空结果
                        —— 放宽或取消这个条件通常就能看到内容。
                    </>
                ) : filtering ? (
                    <>可以尝试减少筛选条件，或更换关键词。</>
                ) : (
                    <>上游索引可能暂时不可用，请稍后重试。</>
                )}
            </p>

            {filtering ? (
                <a className={styles.action} href={resetHref}>
                    清除全部筛选
                </a>
            ) : null}
        </div>
    );
}
