"use client";

import { Typography } from "antd";

import { SORT_OPTIONS } from "@/lib/search/options";
import { hasActiveFilters, type SearchQuery } from "@/lib/search/query";
import { useUiStore } from "@/lib/search/ui-store";

import styles from "./results-summary.module.css";

const { Title, Text } = Typography;

interface ResultsSummaryProps {
    total: number;
    page: number;
    query: SearchQuery;
}

/**
 * What is currently being shown, in one line.
 *
 * A Client Component, because the heading names the ordering and the ordering changes before the results do. The sort
 * control publishes its choice to the shared store and this reads it, so the two move on the same frame. A heading
 * rendered only from the committed query could name nothing except the ordering the visitor has already left.
 *
 * `total` and `page` arrive from the server render as plain numbers, so this island takes no part in fetching.
 *
 * The count is worded as an estimate on purpose. Upstream's `total` is not the number of pageable rows: for
 * `tag=百合` it reports 18,030 while paging runs dry after roughly 2,000 distinct records, and the same result set
 * reports a different total depending on whether the tag value carries a comma prefix. Presenting it as exact would be
 * a claim the visitor can disprove by paging to the end.
 */
export function ResultsSummary({ total, page, query }: ResultsSummaryProps) {
    const proposedSort = useUiStore((state) => state.proposedSort);

    const filtering = hasActiveFilters(query);
    const sort = proposedSort ?? query.sort;
    const sortLabel = SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "最近更新";

    /*
     * A keyword is named because it is the only constraint the visitor typed. Active facets are reported by the badge
     * on the control panel, so counting them here as well would say the same thing twice.
     */
    const heading = query.keyword ? `“${query.keyword}”` : filtering ? "筛选结果" : sortLabel;

    return (
        <div className={styles.summary}>
            <Title level={1} className={styles.heading}>
                {heading}
            </Title>
            <Text type="secondary" className={styles.count}>
                约 {total.toLocaleString("zh-CN")} 本
                {page > 1 ? ` · 第 ${page} 页` : null}
            </Text>
        </div>
    );
}
