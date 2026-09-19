"use client";

/**
 * Reveals a theme change as a growing circle from the control that was pressed.
 *
 * ## Why the View Transitions API
 *
 * A theme change repaints every surface at once. Without help the repaint is a single frame in which the whole page
 * changes, which reads as a flicker rather than as a change the visitor made. `document.startViewTransition` captures
 * the old rendering, lets the new one be produced, and cross-fades between them; a clip-path animation on the incoming
 * snapshot turns that cross-fade into a circle spreading from the button.
 *
 * ## Why the radius is computed from the button
 *
 * The circle has to reach the furthest corner of the viewport, and that distance depends on where the button is. A
 * radius of the viewport diagonal would be correct everywhere and would also move far too fast near the button; the
 * distance to the furthest corner is the smallest radius that covers the screen.
 *
 * ## Why the durations are read from CSS
 *
 * They come from the motion tokens, so the reveal is on the same clock as antd's own transitions and collapses with
 * them when the visitor has asked for reduced motion. Reading them keeps one source for the timing.
 */

/** Wraps a coordinate so the circle covers the viewport from any origin. */
function coverRadius(x: number, y: number): number {
    const dx = Math.max(x, window.innerWidth - x);
    const dy = Math.max(y, window.innerHeight - y);
    return Math.hypot(dx, dy);
}

/**
 * Whether the visitor has asked for reduced motion.
 *
 * A reveal that spreads across the viewport is exactly the kind of motion that setting exists to suppress, so a
 * preference for reduced motion drops it and keeps the change instant.
 */
function prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Reads a duration token, falling back to antd's own value for the medium step. */
function motionDuration(property: string): string {
    const value = getComputedStyle(document.documentElement).getPropertyValue(property).trim();
    return value || "0.3s";
}

/**
 * Runs `change` inside a view transition centred on the given element.
 *
 * The change is applied in all cases. A browser without `startViewTransition` and a visitor who has asked for reduced
 * motion both get the new theme immediately, with no reveal.
 */
export function revealThemeChange(origin: Element | null, change: () => void): void {
    const start = (
        document as Document & {
            startViewTransition?: (callback: () => void) => { ready: Promise<void> };
        }
    ).startViewTransition;

    if (!start || prefersReducedMotion()) {
        change();
        return;
    }

    const rect = origin?.getBoundingClientRect();
    // Without an origin the reveal starts at the top-right corner, where the control lives.
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 40;
    const y = rect ? rect.top + rect.height / 2 : 40;
    const radius = coverRadius(x, y);

    const transition = start.call(document, change);

    /*
     * `ready` resolves once the incoming snapshot exists, which is when it can be styled. Touching the pseudo-element
     * before that has no effect.
     */
    void transition.ready.then(() => {
        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${radius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration: Number.parseFloat(motionDuration("--ant-motion-duration-slow")) * 1000,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                pseudoElement: "::view-transition-new(root)",
            },
        );
    });
}
