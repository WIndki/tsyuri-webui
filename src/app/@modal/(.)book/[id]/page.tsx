import { BookDetailView } from "@/components/book-detail/book-detail-view";
import { singleParam, type RawSearchParams } from "@/lib/search/query";
import { loadBookDetail } from "@/lib/server/book-detail-request";
import { requestTimestamp } from "@/lib/server/request-timestamp";

/**
 * A record, opened over the list.
 *
 * The `(.)` matcher reaches the same segment level, and a `@slot` folder is not a segment, so this intercepts
 * `/book/[id]`. The address bar shows the book, the list stays behind the dialog, and the back button closes the record
 * instead of leaving the results.
 *
 * A Server Component: it resolves the record and renders it into the HTML. The dialog around it comes from the layout in
 * this branch, which mounts before this awaits, so the dialog opens with a placeholder inside rather than appearing
 * late.
 */
interface InterceptedBookProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<RawSearchParams>;
}

export default async function InterceptedBook({ params, searchParams }: InterceptedBookProps) {
    const { id } = await params;
    const raw = await searchParams;

    const book = await loadBookDetail(id, singleParam(raw, "title"));
    const now = requestTimestamp();

    return <BookDetailView book={book} now={now} />;
}
