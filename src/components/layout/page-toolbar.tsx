"use client";

import { useCallback, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { FloatButton, Modal, Typography } from "antd";
import {
    AppstoreOutlined,
    ArrowUpOutlined,
    BulbFilled,
    BulbOutlined,
    QuestionOutlined,
    UnorderedListOutlined,
} from "@ant-design/icons";

import { UPSTREAM_ORIGIN } from "@/lib/api/upstream";
import { storeDisplayMode, type DisplayMode } from "@/lib/theme/display-mode";
import { useThemeMode } from "@/lib/theme/hooks";

const { Paragraph, Title } = Typography;

/**
 * The floating controls.
 *
 * A Client Component because every control reads or writes something the server cannot know: the
 * theme, the current URL, or whether the about dialog is open. It is mounted once by `AppShell`, so
 * the rest of the tree stays server-rendered.
 */
export function PageToolbar() {
    const { mode, toggleTheme } = useThemeMode();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [aboutOpen, setAboutOpen] = useState(false);

    const displayMode: DisplayMode =
        searchParams.get("display") === "pagination" ? "pagination" : "infinite";

    /*
     * Switching presentation is a navigation, because the two modes render different documents:
     * pagination shows one page, infinite scroll shows an accumulation. Writing the choice to the URL
     * is what puts the books in the HTML on the next load; the stored preference is updated as well so
     * a later visit to `/` can start in the chosen mode.
     */
    const toggleDisplayMode = useCallback(() => {
        const next: DisplayMode = displayMode === "infinite" ? "pagination" : "infinite";
        storeDisplayMode(next);

        const params = new URLSearchParams(searchParams.toString());
        if (next === "infinite") params.delete("display");
        else params.set("display", next);

        // Changing presentation returns to the first page: page 7 of one mode has no meaning in the
        // other, and the result windows do not line up.
        params.delete("curr");

        const query = params.toString();
        router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    }, [displayMode, pathname, router, searchParams]);

    return (
        <>
            {/*
             * Offset by the docked panel's height, published as `--panel-height` by `BottomPanelDock`.
             *
             * Both are fixed to the bottom and both sit on the right, so without the offset the tools land on
             * top of the facet header — visible on a phone, where the panel is tall enough to reach them. The
             * offset is the one channel from a client island to another that does not go through props.
             */}
            <FloatButton.Group
                trigger="click"
                shape="circle"
                style={{
                    right: 16,
                    bottom: "calc(var(--panel-height, 0px) + 16px)",
                    zIndex: 101,
                }}
                icon={<ArrowUpOutlined aria-label="工具菜单" />}
            >
                <FloatButton.BackTop
                    icon={<ArrowUpOutlined />}
                    tooltip="返回顶部"
                    aria-label="返回顶部"
                />
                <FloatButton
                    icon={
                        displayMode === "pagination" ? (
                            <AppstoreOutlined />
                        ) : (
                            <UnorderedListOutlined />
                        )
                    }
                    tooltip={displayMode === "pagination" ? "切换到无限滚动" : "切换到分页"}
                    aria-label={displayMode === "pagination" ? "切换到无限滚动" : "切换到分页"}
                    onClick={toggleDisplayMode}
                />
                <FloatButton
                    icon={mode === "dark" ? <BulbFilled /> : <BulbOutlined />}
                    tooltip={mode === "dark" ? "切换到浅色" : "切换到深色"}
                    aria-label={mode === "dark" ? "切换到浅色主题" : "切换到深色主题"}
                    onClick={toggleTheme}
                />
                <FloatButton
                    icon={<QuestionOutlined />}
                    tooltip="关于"
                    aria-label="关于本站"
                    onClick={() => setAboutOpen(true)}
                />
            </FloatButton.Group>

            <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
        </>
    );
}

/**
 * The about dialog.
 *
 * Split into its own component so the open state lives beside the content it controls, and so the
 * toolbar's render stays readable.
 */
function AboutDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    return (
        <Modal open={open} onCancel={onClose} footer={null} title="关于本站" width={520} centered>
            <Paragraph>
                本站是一个<strong>只读</strong>的小说聚合检索界面，用于按标签、来源、字数、纯度与更新频率
                筛选作品。
            </Paragraph>

            <Title level={5}>数据来源</Title>
            <Paragraph>
                全部书目数据来自{" "}
                <a href={UPSTREAM_ORIGIN} target="_blank" rel="noreferrer noopener">
                    {UPSTREAM_ORIGIN}
                </a>
                。本站不存储也不提供任何正文内容；封面图片的版权归原作者与来源平台所有。
            </Paragraph>

            <Title level={5} style={{ marginBottom: 4 }}>
                说明
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                使用 Next.js App Router 服务端渲染，界面基于 Ant Design。请求由服务端代理并缓存，
                浏览器不会直接访问上游接口。
            </Paragraph>
        </Modal>
    );
}
