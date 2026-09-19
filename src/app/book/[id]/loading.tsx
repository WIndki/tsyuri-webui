import { BookDetailSkeleton } from "@/components/book-detail/book-detail-skeleton";

/**
 * Shown while the record is resolved for its own page.
 *
 * Has a back link of its own, because the page does.
 */
export default function BookLoading() {
    return <BookDetailSkeleton />;
}
