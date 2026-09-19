import "server-only";

import { notFound } from "next/navigation";

import type { Book } from "@/lib/api/book";
import { getBookById } from "@/lib/server/book-detail";

/** Ids are numeric strings upstream; anything else cannot resolve. */
const ID_PATTERN = /^\d+$/;

const MAX_TITLE_LENGTH = 200;

/**
 * Resolves the record a detail URL points at.
 *
 * Shared by the full page and the intercepted modal so both accept exactly the same URLs and fail identically.
 * Two implementations would drift, and the drift would only appear in whichever was changed second.
 *
 * ## Why the URL carries the title
 *
 * Upstream has no detail endpoint, so the record has to be found by searching its name. The title therefore
 * travels in the query string to make the lookup possible, while the `id` stays in the path so the canonical URL
 * is stable. `getBookById` requires the returned record to carry the requested `id`, so a stale or edited title
 * degrades to a 404 rather than silently showing a different book.
 */
export async function loadBookDetail(id: string, rawTitle: string | undefined): Promise<Book> {
    const title = (rawTitle ?? "").trim().slice(0, MAX_TITLE_LENGTH);

    if (!ID_PATTERN.test(id) || !title) notFound();

    const book = await getBookById(id, title);
    if (!book) notFound();

    return book;
}

/**
 * Where a "back to results" control should point.
 *
 * Only a `from` that stays inside this application is accepted, so the parameter cannot be used to bounce a
 * visitor to another origin.
 */
export function resolveBackHref(from: string | undefined): string {
    return from && from.startsWith("/search") ? from : "/search";
}
