import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { AntdRegistry } from "@ant-design/nextjs-registry";



import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/layout/providers";
import { THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme/bootstrap-script";

import "./globals.css";

const SITE_NAME = "小说搜索";
const SITE_DESCRIPTION =
    "百合小说聚合检索 — 按标签、来源、字数、纯度与更新频率筛选，数据来自 index.tsyuri.com";

export const metadata: Metadata = {
    title: {
        default: SITE_NAME,
        template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    manifest: "/manifest.webmanifest",
    appleWebApp: {
        capable: true,
        title: SITE_NAME,
        statusBarStyle: "default",
    },
    formatDetection: { telephone: false },
    icons: {
        icon: [
            { url: "/favicon.svg", type: "image/svg+xml" },
            { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        ],
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    // Matches --background in globals.css for each mode, so the browser chrome does not
    // flash white before the stylesheet applies.
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
    ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        // `suppressHydrationWarning` is required because the bootstrap script below sets
        // `data-theme` on this element before React hydrates. It is scoped to this one
        // element and does not mask mismatches anywhere else in the tree.
        <html lang="zh-CN" data-theme="light" suppressHydrationWarning>
            <head>
                {/*
                 * Runs before first paint, so the persisted theme is applied without the
                 * flash-of-wrong-theme that v1 had (it read localStorage inside a
                 * useEffect, i.e. after the first paint).
                 */}
                <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
            </head>
            <body>
                {/*
                 * `AntdRegistry` extracts antd's cssinjs output during SSR. It must wrap
                 * any component that renders antd, and must be inside <body>.
                 */}
                <AntdRegistry><Providers><AppShell>{children}</AppShell></Providers></AntdRegistry>
            </body>
        </html>
    );
}
