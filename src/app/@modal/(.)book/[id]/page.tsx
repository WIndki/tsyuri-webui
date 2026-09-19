import { BookDetailView } from "@/components/book-detail/book-detail-view";
import { loadBookDetail } from "@/lib/server/book-detail-request";
import { requestTimestamp } from "@/lib/server/request-timestamp";

/**
 * A record opened from the list.
 *
 * The `(.)` matcher reaches the same segment level, and a `@slot` folder is not a segment, so this intercepts
 * `/book/[id]` — the URL the full page serves. Opening a result therefore keeps the list on screen while the address
 * bar changes, and the back button closes the record instead of leaving the results.
 *
 * A Server Component: it resolves the record and renders it into the HTML. The dialog around it comes from the layout
 * in this branch, which mounts before this awaits, so the dialog opens with a placeholder inside rather than
 * appearing late.
 */
interface InterceptedBookProps {
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

export default async function InterceptedBook({ params, searchParams }: InterceptedBookProps) {
    const { id } = await params;
    const raw = await searchParams;

    const book = await loadBookDetail(id, readParam(raw, "title"));
    const now = requestTimestamp();

    return <BookDetailView book={book} now={now} />;
}
