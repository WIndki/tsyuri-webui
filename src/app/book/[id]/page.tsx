import type { Metadata } from "next";

import { BackLink } from "@/components/search/back-link";
import { BookDetailView } from "@/components/book-detail/book-detail-view";
import { loadBookDetail, resolveBackHref } from "@/lib/server/book-detail-request";
import { requestTimestamp } from "@/lib/server/request-timestamp";

import styles from "./page.module.css";

/**
 * A book on its own page.
 *
 * This is what a visitor gets by opening a detail URL directly, reloading one, or following a link from outside:
 * the record with the full site frame around it, indexable and shareable.
 *
 * Arriving here by clicking a result does not render this page. The search route intercepts that navigation and
 * presents the same record in a modal over the list, which is why the presentation lives in `BookDetailView` and
 * only the framing differs here.
 */

interface BookDetailPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(
    source: Record<string, string | string[] | undefined>,
    key: string,
): string | undefined {
    const value = source[key];
    if (Array.isArray(value)) return value.at(-1);
    return value;
}

export async function generateMetadata({
    params,
    searchParams,
}: BookDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    const title = readParam(await searchParams, "title");

    if (!/^\d+$/.test(id) || !title) return { title: "书籍详情" };

    return {
        title,
        description: `${title} 的详细信息与标签`,
        alternates: { canonical: `/book/${id}` },
    };
}

export default async function BookDetailPage({ params, searchParams }: BookDetailPageProps) {
    const { id } = await params;
    const raw = await searchParams;

    const book = await loadBookDetail(id, readParam(raw, "title"));
    const backHref = resolveBackHref(readParam(raw, "from"));

    // Pinned once per request so the relative update label is identical on the server render and after hydration.
    const now = requestTimestamp();

    return (
        <div className={styles.page}>
            <BookDetailView book={book} now={now} leading={<BackLink href={backHref} />} />
        </div>
    );
}
