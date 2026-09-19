"use client";

import { Suspense, useEffect, useRef } from "react";

import { BottomPanel } from "@/components/search/bottom-panel";

/**
 * Mounts the bottom panel and publishes its height to the document.
 *
 * The panel is fixed, so it covers whatever is beneath it. Reserving its height avoids the one place that
 * matters: the end of the results list, where the "load more" control and its spinner sit. Without the
 * reservation those scroll behind the panel and become unreachable.
 *
 * The height is written to `--panel-height` on the document element rather than passed down, because the padding
 * belongs to the page content, which is a Server Component. A custom property is the only channel from a client
 * island to server-rendered styles.
 *
 * A `ResizeObserver` rather than a single read: expanding the facet panel changes the height, and the reserved
 * space has to follow, or the list would be padded for a collapsed panel while an expanded one covers it.
 *
 * `Suspense` is required because the panel reads `useSearchParams`. The fallback is empty: the panel is
 * supplementary, and the results behind it are already complete without it.
 */
export function BottomPanelDock() {
    const anchorRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const root = document.documentElement;
        const panel = anchorRef.current?.querySelector<HTMLElement>("[data-bottom-panel]");
        if (!panel) return;

        const publish = () => {
            root.style.setProperty("--panel-height", `${panel.offsetHeight}px`);
        };

        publish();

        const observer = new ResizeObserver(publish);
        observer.observe(panel);

        return () => {
            observer.disconnect();
            root.style.removeProperty("--panel-height");
        };
    }, []);

    return (
        <div ref={anchorRef}>
            <Suspense fallback={null}>
                <BottomPanel />
            </Suspense>
        </div>
    );
}
