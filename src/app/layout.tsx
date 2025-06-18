import type { Metadata } from "next";
import Layout from "@/components/Layout";
import { ReduxProvider } from "@/redux/provider";
import { AntdRegistry } from "@ant-design/nextjs-registry";

import "./globals.css";

export const metadata: Metadata = {
    title: "小说搜索",
    description: "Powered by Next.js Thanks to https://index.tsyuri.com/",
    manifest: "/manifest.webmanifest",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-cn">
            <body>
                <ReduxProvider>
                    <AntdRegistry>
                        <Layout>{children}</Layout>
                    </AntdRegistry>
                </ReduxProvider>
            </body>
        </html>
    );
}
