import type { BookPage } from "@/lib/api/book";
import { hasActiveFilters, type SearchQuery } from "@/lib/search/query";

import styles from "./results-summary.module.css";

interface ResultsSummaryProps {
    page: BookPage;
    query: SearchQuery;
}

/**
 * A one-line description of what is currently being shown.
 *
 * A Server Component, and therefore built from plain semantic HTML rather than antd's
 * `Typography`. `Typography.Text` and `Typography.Title` are *compound* sub-components attached
 * to the exported object at runtime (`Typography.Text = Text`); antd marks its modules
 * `"use client"`, so from a Server Component they are not reachable — the server sees a client
 * reference stub without custom statics, and rendering one throws "Element type is invalid".
 * This was verified by probing the actual values during a server render.
 *
 * Headings and paragraphs are the right primitives here anyway: they carry the document outline
 * that Typography only wraps.
 *
 * The count is worded as an estimate on purpose. Upstream's `total` is not the number of
 * pageable rows: for `tag=百合` it reports 18,030 while paging runs dry after roughly 2,000
 * distinct records, and the same result set reports a *different* total depending on whether
 * the tag value carries a comma prefix. Presenting it as exact would be a claim the visitor can
 * disprove by paging to the end.
 */
export function ResultsSummary({ page, query }: ResultsSummaryProps) {
    const filtering = hasActiveFilters(query);

    return (
        <div className={styles.summary}>
            <h1 className={styles.heading}>
                {query.keyword ? `“${query.keyword}”` : filtering ? "筛选结果" : "最近更新"}
            </h1>
            <p className={styles.count}>
                约 {page.total.toLocaleString("zh-CN")} 本
                {page.page > 1 ? ` · 第 ${page.page} 页` : null}
            </p>
        </div>
    );
}
