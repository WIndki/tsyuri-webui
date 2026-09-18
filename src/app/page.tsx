import type { Metadata } from "next";

import SearchPage from "@/app/search/page";

/**
 * The home route.
 *
 * Renders the same Server Component as `/search` rather than redirecting, so the landing page
 * is the search UI itself with no extra round-trip. A redirect would cost a full request on the
 * most common entry point, and `searchParams` handling is identical either way.
 *
 * `/search` stays the canonical URL once a query exists, because that is the path
 * `toSearchHref` writes and the one `generateMetadata` declares canonical.
 */
export const metadata: Metadata = {
    description: "百合小说聚合检索 — 按标签、来源、字数、纯度与更新频率筛选",
};

export default async function HomePage(props: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    return <SearchPage {...props} />;
}
