"use client";

import { useState } from "react";

import { Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import { useUiStore } from "@/lib/search/ui-store";
import { useSearchNavigation } from "@/lib/search/use-search-navigation";
import type { SearchQuery } from "@/lib/search/query";

import styles from "./search-bar.module.css";

interface SearchBarProps {
    query: SearchQuery;
}

/**
 * The keyword input.
 *
 * A Client Component because it owns the in-progress text. The draft is local state rather than URL
 * state so that typing does not push a history entry per keystroke — the URL is written only on
 * submit. v1 debounced every keystroke into a full search, which produced dozens of identical
 * cached requests and an unusable back button.
 */
export function SearchBar({ query }: SearchBarProps) {
    const { applyPatch } = useSearchNavigation();
    /*
     * The button reports the shared wait rather than a `useTransition` flag of its own.
     *
     * `useTransition` clears when the router commits the new URL, about a second before the results arrive, so
     * the spinner would stop while the page was still loading. The shared wait ends when the payload lands.
     */
    const isWaiting = useUiStore((state) => state.isWaiting);
    const [draft, setDraft] = useState(query.keyword);

    /*
     * Re-sync the draft when the committed keyword changes from the outside — a back/forward
     * navigation, or a filter reset.
     *
     * This is React's documented "adjust state when a prop changes" pattern: compare against a
     * stored previous value *during render* and re-render immediately, rather than writing the
     * state in an effect. The effect version renders the stale value first and then corrects it in
     * a second pass, which is both a visible flicker and what `react-hooks/set-state-in-effect`
     * warns about.
     * See https://react.dev/reference/react/useState#storing-information-from-previous-renders
     */
    const [committedKeyword, setCommittedKeyword] = useState(query.keyword);
    if (committedKeyword !== query.keyword) {
        setCommittedKeyword(query.keyword);
        setDraft(query.keyword);
    }

    const trimmed = draft.trim();
    const unchanged = trimmed === query.keyword;

    return (
        <form
            role="search"
            className={styles.form}
            onSubmit={(event) => {
                event.preventDefault();
                // Submitting an emptied field is how the keyword is cleared, so the control stays
                // enabled when the draft matches what is already applied.
                applyPatch(query, { keyword: trimmed });
            }}
        >
            <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="搜索书名或简介，例如：魔法少女"
                size="large"
                allowClear
                prefix={<SearchOutlined aria-hidden className={styles.icon} />}
                aria-label="搜索关键词"
                // `type="search"` gives mobile keyboards a search key and lets the browser offer
                // its own clear affordance.
                type="search"
                className={styles.input}
            />
            <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={isWaiting}
                disabled={unchanged}
                className={styles.submit}
            >
                {query.keyword && !trimmed ? "清除" : "搜索"}
            </Button>
        </form>
    );
}
