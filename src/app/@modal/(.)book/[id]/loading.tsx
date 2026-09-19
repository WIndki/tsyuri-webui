import { BookDetailSkeleton } from "@/components/book-detail/book-detail-skeleton";

/**
 * Shown inside the dialog while the record is resolved.
 *
 * Without this the dialog would open empty and then fill in, which reads as a fault rather than as progress. The page
 * branch shows the same placeholder, so the two waits look identical.
 *
 * No back link: the dialog closes back to the list it covers.
 */
export default function InterceptedBookLoading() {
    return <BookDetailSkeleton />;
}
