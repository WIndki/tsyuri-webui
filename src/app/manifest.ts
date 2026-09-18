import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/**
 * The web app manifest.
 *
 * v1's version referenced four icon files that did not exist — `/icon-96x96.png`,
 * `/icon-192x192.png`, `/icon-512x512.png` and `/apple-touch.png` — while `public/` actually
 * contained `favicon-96x96.png`, `web-app-manifest-192x192.png`,
 * `web-app-manifest-512x512.png` and `apple-touch-icon.png`. Every icon 404'd, so installing
 * the app produced a blank tile.
 *
 * The paths below are the real files in `public/`, which is worth re-checking whenever the
 * icons are replaced: nothing else validates a manifest's icon URLs at build time.
 */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "小说搜索",
        short_name: "小说搜索",
        description: "百合小说聚合检索",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        lang: "zh-CN",
        icons: [
            {
                src: "/favicon-96x96.png",
                sizes: "96x96",
                type: "image/png",
            },
            {
                src: "/web-app-manifest-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/web-app-manifest-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    };
}
