"use client";

import { Select, Typography } from "antd";

import {
    BOOK_STATUS_OPTIONS,
    PURITY_OPTIONS,
    SOURCE_OPTIONS,
    TAG_OPTIONS,
    UPDATE_PERIOD_OPTIONS,
    WORD_COUNT_STEPS,
} from "@/lib/search/options";
import type { FacetValues } from "@/lib/search/query";

import styles from "./filter-controls.module.css";

const { Text } = Typography;

/** Sentinel for "no constraint". antd `Select` and `Segmented` both need a concrete value. */
const ANY = "__any__";

interface FilterControlsProps {
    /** Current facet values, already validated. `undefined` means "no constraint". */
    values: FacetValues;
    /** Applies a patch; `undefined` values clear the corresponding filter. */
    onChange: (patch: Partial<FacetValues>) => void;
}

/** Builds `不限` + an option table into a `Select`-ready list. */
function withAny(options: readonly { value: string; label: string }[]) {
    return [{ value: ANY, label: "不限" }, ...options.map(({ value, label }) => ({ value, label }))];
}

/**
 * Builds `不限` + an option table into a `Select`-ready list, carrying the explanations.
 *
 * `description` is why these are `Select`s rather than segmented controls: each threshold states how wide it is
 * ("A+ / A / A-, 约 6,700 本"), and a segmented control has nowhere to put that. `labelInValue` is not needed — the
 * option label is the text shown in the field, and the description appears in the menu.
 */
function withAnyDescribed(
    options: readonly { value: string; label: string; description?: string }[],
) {
    return [
        { value: ANY, label: "不限" },
        ...options.map(({ value, label, description }) => ({
            value,
            label: description ? `${label} · ${description}` : label,
        })),
    ];
}

function clearIfAny(value: string): string | undefined {
    return value === ANY ? undefined : value;
}

/**
 * The facet controls.
 *
 * A Client Component. Every control applies immediately — there is no "apply" button, because each change is a cheap,
 * cached server read and an explicit commit step only adds a way to lose work.
 *
 * `tag` and `source` are single `Select`s rather than multi-selects on purpose. Upstream accepts exactly one value for
 * each and answers any comma-joined form with zero results, so a multi-select would be a control that silently cannot
 * work. See `parseSearchQuery`.
 *
 * Every control is a `Select` or an `InputNumber`-free `Select`, and each sits in its own grid cell at full width. A
 * segmented control was used for the status, purity and update thresholds and could not fit a phone: six purity options
 * need 461px, so on a 412px screen the control ran past the edge and was clipped, because the document hides horizontal
 * overflow. A `Select` fits any width and has room for the descriptions.
 *
 * `purity` is a quality *threshold* rather than a grade selector, which is what the parameter actually means: a smaller
 * number is a stricter filter and the result sets are nested.
 */
export function FilterControls({ values, onChange }: FilterControlsProps) {
    return (
        <div className={styles.grid}>
            <label className={styles.field}>
                <Text type="secondary">标签</Text>
                <Select
                    value={values.tag ?? ANY}
                    onChange={(value) => onChange({ tag: clearIfAny(value) })}
                    options={withAny(TAG_OPTIONS)}
                    aria-label="按标签筛选"
                />
            </label>

            <label className={styles.field}>
                <Text type="secondary">来源</Text>
                <Select
                    value={values.source ?? ANY}
                    onChange={(value) => onChange({ source: clearIfAny(value) })}
                    options={withAny(SOURCE_OPTIONS)}
                    aria-label="按来源筛选"
                />
            </label>

            <label className={styles.field}>
                <Text type="secondary">状态</Text>
                <Select
                    value={values.bookStatus ?? ANY}
                    onChange={(value) => onChange({ bookStatus: clearIfAny(value) })}
                    options={withAny(BOOK_STATUS_OPTIONS)}
                    aria-label="按状态筛选"
                />
            </label>

            <label className={styles.field}>
                <Text type="secondary">纯度</Text>
                <Select
                    value={values.purity ?? ANY}
                    onChange={(value) => onChange({ purity: clearIfAny(value) })}
                    options={withAnyDescribed(PURITY_OPTIONS)}
                    aria-label="按纯度筛选"
                />
            </label>

            <label className={styles.field}>
                <Text type="secondary">最少字数</Text>
                <Select
                    value={values.wordCountMin ?? ANY}
                    onChange={(value) => onChange({ wordCountMin: clearIfAny(value) })}
                    options={[
                        { value: ANY, label: "不限" },
                        ...WORD_COUNT_STEPS.map(({ value, label }) => ({
                            value,
                            label: `${label}以上`,
                        })),
                    ]}
                    aria-label="最少字数"
                />
            </label>

            <label className={styles.field}>
                <Text type="secondary">最多字数</Text>
                <Select
                    value={values.wordCountMax ?? ANY}
                    onChange={(value) => onChange({ wordCountMax: clearIfAny(value) })}
                    options={[
                        { value: ANY, label: "不限" },
                        ...WORD_COUNT_STEPS.map(({ value, label }) => ({
                            value,
                            label: `${label}以下`,
                        })),
                    ]}
                    aria-label="最多字数"
                />
            </label>

            <label className={styles.field}>
                <Text type="secondary">更新时间</Text>
                <Select
                    value={values.updatePeriod ?? ANY}
                    onChange={(value) => onChange({ updatePeriod: clearIfAny(value) })}
                    options={withAny(UPDATE_PERIOD_OPTIONS)}
                    aria-label="按更新时间筛选"
                />
            </label>
        </div>
    );
}
