"use client";

import { Segmented, Space, Typography } from "antd";

import { SORT_OPTIONS, type SortValue } from "@/lib/search/options";
import { useUiStore } from "@/lib/search/ui-store";
import { useSearchNavigation } from "@/lib/search/use-search-navigation";
import type { SearchQuery } from "@/lib/search/query";

const { Text } = Typography;

interface SortControlProps {
    query: SearchQuery;
}

/**
 * The result ordering.
 *
 * Presented on its own rather than inside the facet controls, because ordering is not a constraint: the facets
 * decide *which* books are returned and the sort decides what order they arrive in. Keeping them apart is also
 * what lets "clear all filters" reset the constraints without touching the visitor's choice of ordering.
 *
 * It does navigate, and it does reset to the first page, because a new ordering invalidates the position within
 * the old one: page 7 of "recently updated" has no counterpart in "longest first".
 */
export function SortControl({ query }: SortControlProps) {
    const { applyPatch } = useSearchNavigation();
    const isWaiting = useUiStore((state) => state.isWaiting);

    return (
        <Space size={8} wrap>
            <Text type="secondary">排序</Text>
            <Segmented
                value={query.sort}
                // Disabled while a read is in flight, so a second ordering cannot be requested before the first
                // arrives and leave the visitor unsure which one the results reflect.
                disabled={isWaiting}
                onChange={(value) => applyPatch(query, { sort: value as SortValue })}
                options={SORT_OPTIONS.map(({ value, label }) => ({ value, label }))}
                aria-label="结果排序"
            />
        </Space>
    );
}
