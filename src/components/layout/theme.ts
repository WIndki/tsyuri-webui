"use client";

import { theme, type ThemeConfig } from "antd";

import { BRAND, type ThemeMode } from "@/lib/theme/preferences";

/**
 * antd v6 theme configuration.
 *
 * This lives beside the provider, in a Client Component module, deliberately: the returned
 * object contains the `darkAlgorithm`/`defaultAlgorithm` *functions*, which cannot cross the
 * server/client boundary as props. v1's equivalent was imported into a server-rendered
 * layout, which is exactly the kind of mistake this split prevents.
 *
 * Two changes relative to v1:
 *
 * 1. **One seed palette for both modes.** v1 duplicated the whole palette per mode, which let
 *    `colorSuccess` and friends drift apart. antd's dark algorithm derives a correct ramp
 *    from the same seed, so only the primary hue is overridden — it needs more luminance on
 *    a dark surface to hold its contrast ratio.
 * 2. **`cssVar` is requested explicitly.** It defaults to off in v6, and the plain-CSS
 *    modules in this app read `var(--ant-*)` values, so it is load-bearing rather than
 *    cosmetic.
 */
export function createThemeConfig(mode: ThemeMode): ThemeConfig {
    return {
        algorithm: mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
        cssVar: { prefix: "ant" },
        token: {
            colorPrimary: BRAND[mode],
            borderRadius: 6,
            wireframe: false,
            // antd's default 1.57 leading is cramped for mixed CJK/Latin card bodies.
            lineHeight: 1.6,
            fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif',

            /*
             * Motion, set through antd's own tokens so every component animates on one clock.
             *
             * The three durations are overridden directly rather than through `motionUnit`. That basis
             * rounds: 0.08 produces 0.1 s / 0.2 s / 0.2 s, which makes the medium and slow steps identical
             * and so removes a distinction the components rely on. Setting them explicitly gives a scale
             * that actually descends, which is what makes a hover feel quicker than a panel opening.
             *
             * 80 ms is short enough that a hover or a focus ring reads as immediate rather than as a
             * transition, while still being one. The slow step stays at antd's 300 ms: it is used for large
             * surfaces, where a faster motion reads as a jump.
             *
             * The easing curves are left alone. `motionEaseOutCirc` already decelerates the way a panel
             * opening or a menu appearing should, and hand-picked curves would make this application's
             * motion inconsistent with the antd components it embeds.
             */
            motionDurationFast: "0.08s",
            motionDurationMid: "0.16s",
            motionDurationSlow: "0.3s",
        },
        components: {
            Card: {
                // The grid is dense; a tighter body keeps a full row above the fold.
                bodyPadding: 14,
                headerFontSize: 15,
            },
            Layout: {
                // Cards sit directly on the page background, not a nested surface.
                bodyBg: "transparent",
                headerBg: "transparent",
            },
            Collapse: {
                headerPadding: "10px 14px",
                contentPadding: 14,
            },
            FloatButton: {
                boxShadowSecondary: "0 6px 16px rgba(0, 0, 0, 0.15)",
            },
        },
    };
}
