import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/Layout";
import { ReduxProvider } from "@/redux/provider";

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
        <html lang="en">
            <body>
                <ReduxProvider>
                    <Layout>{children}</Layout>
                </ReduxProvider>
            </body>
        </html>
    );
}
