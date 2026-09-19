"use client";

import { Segmented, Select, Space, Typography } from "antd";

import {
    BOOK_STATUS_OPTIONS,
    PURITY_OPTIONS,
    SOURCE_OPTIONS,
    TAG_OPTIONS,
    UPDATE_PERIOD_OPTIONS,
    WORD_COUNT_STEPS,
} from "@/lib/search/options";
import type { FacetValues } from "@/lib/search/query";

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

function clearIfAny(value: string): string | undefined {
    return value === ANY ? undefined : value;
}

/**
 * The facet controls.
 *
 * A Client Component. Every control applies immediately — there is no "apply" button, because
 * each change is a cheap, cached server read and an explicit commit step only adds a way to
 * lose work.
 *
 * `tag` and `source` are single `Select`s rather than multi-selects on purpose. Upstream
 * accepts exactly one value for each and answers any comma-joined form with zero results, so a
 * multi-select would be a control that silently cannot work. See `parseSearchQuery`.
 *
 * `purity` is presented as a quality *threshold* rather than a grade selector, which is what
 * the parameter actually means: a smaller number is a stricter filter and the result sets are
 * nested. v1 labelled these A+/A/A-/B as if they were independent grades.
 */
export function FilterControls({ values, onChange }: FilterControlsProps) {
    return (
        <Space orientation="vertical" size={12} style={{ width: "100%" }}>
            <Space size={8} wrap>
                <Text type="secondary">标签</Text>
                <Select
                    value={values.tag ?? ANY}
                    onChange={(value) => onChange({ tag: clearIfAny(value) })}
                    options={withAny(TAG_OPTIONS)}
                    style={{ minWidth: 132 }}
                    aria-label="按标签筛选"
                />

                <Text type="secondary">来源</Text>
                <Select
                    value={values.source ?? ANY}
                    onChange={(value) => onChange({ source: clearIfAny(value) })}
                    options={withAny(SOURCE_OPTIONS)}
                    style={{ minWidth: 132 }}
                    aria-label="按来源筛选"
                />

                <Text type="secondary">状态</Text>
                <Segmented
                    value={values.bookStatus ?? ANY}
                    onChange={(value) => onChange({ bookStatus: clearIfAny(String(value)) })}
                    options={withAny(BOOK_STATUS_OPTIONS)}
                />
            </Space>

            <Space size={8} wrap>
                <Text type="secondary">字数</Text>
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
                    style={{ minWidth: 116 }}
                    aria-label="最少字数"
                />
                <Text type="secondary">至</Text>
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
                    style={{ minWidth: 116 }}
                    aria-label="最多字数"
                />
            </Space>

            <Space size={8} wrap>
                <Text type="secondary">纯度</Text>
                <Segmented
                    value={values.purity ?? ANY}
                    onChange={(value) => onChange({ purity: clearIfAny(String(value)) })}
                    options={withAny(PURITY_OPTIONS)}
                />
            </Space>

            <Space size={8} wrap>
                <Text type="secondary">更新</Text>
                <Segmented
                    value={values.updatePeriod ?? ANY}
                    onChange={(value) => onChange({ updatePeriod: clearIfAny(String(value)) })}
                    options={withAny(UPDATE_PERIOD_OPTIONS)}
                />
            </Space>
        </Space>
    );
}
