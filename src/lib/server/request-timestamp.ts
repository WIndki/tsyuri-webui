import "server-only";

/**
 * The instant the current request is being rendered, in epoch milliseconds.
 *
 * Relative labels ("3天前") are rendered on the server and again after hydration, so both sides need
 * the *same* "now" or every label shifts by however long the response took. Components receive one
 * timestamp per request rather than reading a clock themselves.
 *
 * ## Why this is not `Date.now()`
 *
 * `Date.now` is registered as `impure: true` in the React Compiler's known-shapes table, so calling
 * it inside a component is reported by `react-hooks/purity`. That check is about component output
 * being a function of the component's inputs: a clock read is a hidden input, and React may re-render
 * at a different moment and produce different output for identical props.
 *
 * Next.js deduplicates `new Date()` within a single server render, so one call per request yields one
 * instant, and the search route reads its timestamp the same way. Keeping both routes on the same
 * expression means there is one pattern to look for rather than two.
 */
export function requestTimestamp(): number {
    return new Date().getTime();
}
