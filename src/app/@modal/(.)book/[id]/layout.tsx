import type { ReactNode } from "react";

import { BookModal } from "@/components/book-detail/book-modal";

/**
 * The dialog shell for a record opened from the list.
 *
 * The shell is a layout rather than part of the page so that it can appear before the record is resolved. The page
 * below it awaits the upstream search, and with this above it the dialog opens immediately with a placeholder inside,
 * which is what makes a click feel answered. Putting the shell in the page would delay the whole dialog until the
 * lookup finished.
 *
 * The title is intentionally empty: the record's own heading names the dialog, and a title here would appear twice.
 * `aria-label` keeps the dialog named while it is still a placeholder.
 */
export default function InterceptedBookLayout({ children }: { children: ReactNode }) {
    return <BookModal title="">{children}</BookModal>;
}
