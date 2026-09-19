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
 * ## Why the URL carries the title
 *
 * Upstream has no detail endpoint, so the record has to be found by searching its name. The title therefore travels in
 * the query string to make the lookup possible, while the `id` stays in the path so the URL is stable. `getBookById`
 * requires the returned record to carry the requested `id`, so a stale or edited title degrades to a 404 rather than
 * silently showing a different book.
 */
export async function loadBookDetail(id: string, rawTitle: string | undefined): Promise<Book> {
    const title = (rawTitle ?? "").trim().slice(0, MAX_TITLE_LENGTH);

    if (!ID_PATTERN.test(id) || !title) notFound();

    const book = await getBookById(id, title);
    if (!book) notFound();

    return book;
}
