"use client";

import { useState } from "react";

import { Badge, Button, Collapse, Typography } from "antd";
import { FilterOutlined } from "@ant-design/icons";

import { FilterControls } from "@/components/search/filter-controls";
import { SortControl } from "@/components/search/sort-control";
import { clearedFilters, countActiveFilters, type FacetValues, type SearchQuery } from "@/lib/search/query";
import { useUiStore } from "@/lib/search/ui-store";
import { useSearchNavigation } from "@/lib/search/use-search-navigation";

import styles from "./search-panel.module.css";

const { Text } = Typography;

interface SearchPanelProps {
    query: SearchQuery;
}

/**
 * The collapsible facet panel.
 *
 * A Client Component, and the only place facet changes are committed. The query comes from props, which the
 * server rendered from the URL, and changes are written back to the URL, so there is no local copy of the
 * search state that could fall out of agreement with the address bar.
 *
 * Values the visitor has chosen but the server has not confirmed are layered over the committed ones, so a
 * control reflects a click immediately. The proposals are kept out of the URL so the address bar never
 * claims a result set that has not loaded.
 *
 * Collapsed by default, because the panel is docked and its height is height the results lose. The badge on
 * the header reports how many constraints are active, which is what keeps a collapsed panel readable.
 */
export function SearchPanel({ query }: SearchPanelProps) {
    const { applyPatch } = useSearchNavigation();
    const proposed = useUiStore((state) => state.proposed);

    /*
     * Collapsed to begin with.
     *
     * The panel is docked to the bottom, so its height is height the results do not get. Expanded, the six rows
     * of facets take about 410px of a 900px viewport, which leaves the grid barely half the screen. The badge on
     * the header reports how many constraints are active, so a collapsed panel still says whether anything is
     * narrowing the result set.
     */
    const [open, setOpen] = useState(false);

    /*
     * The rendered query, with any outstanding proposals applied.
     *
     * `undefined` in a proposal is meaningful — it clears a facet — so the check is for the key's presence
     * rather than for a truthy value.
     */
    const displayed: FacetValues = { ...query };
    for (const [key, value] of Object.entries(proposed)) {
        (displayed as Record<string, unknown>)[key] = value;
    }

    const activeCount = countActiveFilters(displayed);

    return (
        <div className={styles.panel}>
            {/*
             * Ordering sits above the collapsible facets and stays visible when they are collapsed, because it is
             * used more often than any single facet and it is not a constraint: it changes the order of the
             * results, not which results there are.
             */}
            <div className={styles.sort}>
                <SortControl query={query} />
            </div>

            <Collapse
                ghost
                activeKey={open ? ["filters"] : []}
                onChange={(keys) => setOpen(keys.length > 0)}
                // antd v6 takes `items`; `Collapse.Panel` was removed.
                items={[
                    {
                        key: "filters",
                        label: (
                            <span className={styles.label}>
                                <FilterOutlined aria-hidden />
                                <Text strong>筛选条件</Text>
                                {activeCount > 0 ? (
                                    <Badge
                                        count={activeCount}
                                        color="var(--accent)"
                                        aria-label={`已应用 ${activeCount} 个筛选条件`}
                                    />
                                ) : null}
                            </span>
                        ),
                        children: (
                            <div className={styles.body}>
                                <FilterControls
                                    values={displayed}
                                    onChange={(patch) => applyPatch(query, patch)}
                                />
                                {activeCount > 0 ? (
                                    <Button
                                        size="small"
                                        type="link"
                                        className={styles.clear}
                                        onClick={() =>
                                            applyPatch(clearedFilters(query), { page: 1 })
                                        }
                                    >
                                        清除全部筛选
                                    </Button>
                                ) : null}
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    );
}
