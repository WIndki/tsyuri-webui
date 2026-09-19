import type { ReactNode } from "react";

import { BookModal } from "@/components/book-detail/book-modal";

/**
 * The dialog around a record.
 *
 * A layout rather than part of the page, so the dialog can appear before the record is resolved: the page below it awaits
 * the upstream lookup, and with this above it the dialog opens immediately with a placeholder inside. Putting the shell
 * in the page would delay the whole dialog until the lookup finished.
 */
export default function InterceptedBookLayout({ children }: { children: ReactNode }) {
    return <BookModal>{children}</BookModal>;
}
