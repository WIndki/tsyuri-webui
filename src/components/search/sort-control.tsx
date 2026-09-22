"use client";

import { Segmented, Typography } from "antd";

import { SORT_OPTIONS, type SortValue } from "@/lib/search/options";
import { useUiStore } from "@/lib/search/ui-store";
import { useSearchNavigation } from "@/lib/search/use-search-navigation";
import type { SearchQuery } from "@/lib/search/query";

import styles from "./sort-control.module.css";

const { Text } = Typography;

interface SortControlProps {
    query: SearchQuery;
}

/**
 * The result ordering.
 *
 * Presented on its own rather than inside the facet controls, because ordering is not a constraint: the facets decide
 * *which* books are returned and the sort decides what order they arrive in. Keeping them apart is also what lets "clear
 * all filters" reset the constraints without touching the visitor's choice of ordering.
 *
 * It does navigate, and it does reset to the first page, because a new ordering invalidates the position within the old
 * one: page 7 of "recently updated" has no counterpart in "longest first".
 *
 * A `label` element rather than antd's `Space`, so the row is a single flex container whose second child can be told to
 * shrink. Inside a `Space` the control sat in an extra wrapper that sized itself to the control's min-content width, which
 * for four options is about 316px — wider than a 320px phone allows once the panel padding is taken out.
 */
export function SortControl({ query }: SortControlProps) {
    const { applyPatch } = useSearchNavigation();
    const proposedSort = useUiStore((state) => state.proposedSort);
    const proposeSort = useUiStore((state) => state.proposeSort);

    return (
        <label className={styles.row}>
            <Text type="secondary">排序</Text>
            <Segmented
                /*
                 * The proposed ordering while one is outstanding, so the control and the heading above the results name
                 * the same thing. Both read the same value, so they cannot disagree.
                 */
                value={proposedSort ?? query.sort}
                onChange={(value) => {
                    proposeSort(String(value));
                    applyPatch(query, { sort: value as SortValue });
                }}
                options={SORT_OPTIONS.map(({ value, label }) => ({ value, label }))}
                /*
                 * `small` throughout, not only on a phone. Its narrower item padding is what lets four options fit a
                 * 320px screen at all — the default padding needs about 312px where the panel has 292px — and the docked
                 * panel is a compact tool, so the tighter control suits the wide case too.
                 */
                size="small"
                aria-label="结果排序"
            />
        </label>
    );
}
