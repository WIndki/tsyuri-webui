/**
 * A single, narrow error type for the whole data layer.
 *
 * v1 translated fetch failures into user-facing Chinese strings inside the API layer and
 * then translated them *again* in the error hooks, so one failure could surface with
 * different wording depending on which path caught it. Here the data layer reports a
 * *kind* plus the upstream message, and presentation decides the copy.
 */

export type BookIndexErrorKind =
    /** DNS failure, connection refused, offline. */
    | "network"
    /** Our own timeout budget elapsed. */
    | "timeout"
    /** Reached upstream, but it answered with a non-success `code`. */
    | "upstream"
    /** Reached upstream, but the body was not the expected envelope. */
    | "malformed"
    /** Aborted because the caller went away (navigation, unmount). */
    | "aborted"
    | "unknown";

export class BookIndexError extends Error {
    readonly kind: BookIndexErrorKind;

    /**
     * The upstream `msg`, when there was one.
     *
     * Kept for logging only. It is sometimes an internal hint ("未知异常，请联系管理员！")
     * and must never be shown to a visitor verbatim.
     */
    readonly upstreamMessage?: string;

    /** Upstream `code`, when the failure was an in-body rejection. */
    readonly upstreamCode?: string;

    constructor(
        kind: BookIndexErrorKind,
        message: string,
        options?: { upstreamMessage?: string; upstreamCode?: string; cause?: unknown },
    ) {
        super(message, { cause: options?.cause });
        this.name = "BookIndexError";
        this.kind = kind;
        this.upstreamMessage = options?.upstreamMessage;
        this.upstreamCode = options?.upstreamCode;
    }
}

/** Copy shown to a visitor for each failure kind. */
const USER_MESSAGES: Record<BookIndexErrorKind, string> = {
    network: "网络连接失败，请检查网络后重试",
    timeout: "索引服务响应超时，请稍后重试",
    upstream: "索引服务暂时不可用，请稍后重试",
    malformed: "索引服务返回了无法解析的数据",
    aborted: "请求已取消",
    unknown: "加载失败，请稍后重试",
};

export function userMessageFor(error: unknown): string {
    if (error instanceof BookIndexError) return USER_MESSAGES[error.kind];
    return USER_MESSAGES.unknown;
}

/**
 * `true` when retrying the identical request could plausibly succeed.
 *
 * Drives whether a retry affordance is offered. A malformed body is not worth an immediate
 * retry, but a timeout or an upstream rejection might be.
 */
export function isRetryable(error: unknown): boolean {
    if (!(error instanceof BookIndexError)) return true;
    return (
        error.kind === "network" || error.kind === "timeout" || error.kind === "upstream"
    );
}
