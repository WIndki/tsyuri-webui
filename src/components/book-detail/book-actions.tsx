"use client";

import { useCallback } from "react";

import { App, Button, Space, Tooltip } from "antd";
import { CopyOutlined, SearchOutlined } from "@ant-design/icons";

import styles from "./book-actions.module.css";

interface BookActionsProps {
    title: string;
}

/**
 * What a visitor does with a record once they have read it.
 *
 * ## Copy
 *
 * Writing the title to the clipboard is the one action this site can complete on its own, so it reports its result
 * directly. The confirmation comes from `App.useMessage` rather than the static `message` API, because the static form
 * renders outside the `ConfigProvider` and would lose the theme.
 *
 * ## Search
 *
 * The record aggregates published bibliographic data and the site holds no text, so a visitor who wants to read the
 * book has to leave. Offering that as one button saves retyping a title that is often long and punctuated.
 *
 * `window.open` with an explicit `noopener` is used rather than assigning to `window.location.href`: this runs inside a
 * click handler, so every browser permits it, and the record stays open behind the new tab. Assigning to `location`
 * would leave the site for the same result.
 */
export function BookActions({ title }: BookActionsProps) {
    const { message } = App.useApp();

    const copy = useCallback(async () => {
        await navigator.clipboard.writeText(title);
        message.success(`已复制「${title}」`);
    }, [message, title]);

    const search = useCallback(() => {
        const target = `https://www.baidu.com/s?wd=${encodeURIComponent(title)}`;
        window.open(target, "_blank", "noopener,noreferrer");
    }, [title]);

    return (
        <Space className={styles.actions} size={8} wrap>
            <Tooltip title="将书名复制到剪贴板">
                <Button type="primary" icon={<CopyOutlined />} onClick={copy}>
                    复制名称
                </Button>
            </Tooltip>

            <Tooltip title="在新标签页中搜索该书">
                <Button icon={<SearchOutlined />} onClick={search}>
                    搜索该书
                </Button>
            </Tooltip>
        </Space>
    );
}
