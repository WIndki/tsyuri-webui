import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "小说搜素",
        short_name: "小说搜素",
        description: "百合小说",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
            {
                src: "/icon-96x96.png",
                sizes: "96x96",
                type: "image/png",
            },
            {
                src: "/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
            },
            {
                src: "/apple-touch.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    };
}
