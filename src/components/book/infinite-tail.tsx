"use client";

import { useEffect, useRef } from "react";

import { Button, Space, Spin, Typography } from "antd";

const { Text } = Typography;

interface InfiniteTailProps {
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
}

/**
 * The infinite-scroll trigger.
 *
 * Replaces `react-infinite-scroll-component`, which is unmaintained and whose React 19 support
 * is unofficial. The only behaviour actually required is "call this when a sentinel becomes
 * visible", which `IntersectionObserver` does directly.
 *
 * A manual button is kept alongside the observer rather than as a fallback afterthought. It
 * covers a short result set where the sentinel is on screen before the observer can fire, a
 * browser without `IntersectionObserver`, and a visitor who simply prefers to control when more
 * content loads.
 */
export function InfiniteTail({ hasMore, isLoading, onLoadMore }: InfiniteTailProps) {
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node || !hasMore || isLoading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
            },
            // Starts the fetch well before the sentinel is on screen, so the next page is
            // usually already rendered by the time the visitor reaches the bottom.
            { rootMargin: "600px 0px" },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [hasMore, isLoading, onLoadMore]);

    if (!hasMore) {
        return (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Text type="secondary">已经到底了</Text>
            </div>
        );
    }

    return (
        <div ref={sentinelRef} style={{ textAlign: "center", padding: "24px 0" }}>
            <Space orientation="vertical" size={8}>
                {isLoading ? <Spin size="small" /> : null}
                <Button type="link" loading={isLoading} onClick={onLoadMore}>
                    {isLoading ? "加载中…" : "加载下一页"}
                </Button>
            </Space>
        </div>
    );
}
