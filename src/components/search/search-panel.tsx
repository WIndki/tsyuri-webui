"use client";

import { useState } from "react";

import { Badge, Button, Collapse, Typography } from "antd";
import { FilterOutlined } from "@ant-design/icons";

import { FilterControls } from "@/components/search/filter-controls";
import { useSearchNavigation } from "@/lib/search/use-search-navigation";
import { clearedFilters, countActiveFilters, type SearchQuery } from "@/lib/search/query";

import styles from "./search-panel.module.css";

const { Text } = Typography;

interface SearchPanelProps {
    query: SearchQuery;
}

/**
 * The collapsible facet panel.
 *
 * A Client Component, and the only place filter changes are committed. It reads the current query
 * from props, which the server rendered from the URL, and writes changes back to the URL, so there
 * is no local copy of the search state that could fall out of agreement with the address bar.
 *
 * Open by default because the facets are the reason this interface exists, but collapsible so a
 * visitor who is browsing the default ordering can reclaim the vertical space. The badge reports
 * how many constraints are active, which is what makes the collapsed state readable.
 */
export function SearchPanel({ query }: SearchPanelProps) {
    const { applyPatch } = useSearchNavigation();
    const activeCount = countActiveFilters(query);
    const [open, setOpen] = useState(true);

    return (
        <div className={styles.panel}>
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
                                    values={query}
                                    onChange={(patch) => applyPatch(query, patch)}
                                />
                                {activeCount > 0 ? (
                                    <Button
                                        size="small"
                                        type="link"
                                        className={styles.clear}
                                        onClick={() =>
                                            applyPatch(clearedFilters(query), {
                                                page: 1,
                                            })
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
