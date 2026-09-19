import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactStrictMode: true,

    // antd ships large ESM trees; transpiling them keeps Turbopack's module graph
    // deterministic instead of relying on the bundler's CJS interop heuristics.
    transpilePackages: ["antd", "@ant-design/icons", "@ant-design/cssinjs"],

    // Upstream cover art lives on third-party CDNs. Declaring the allowed hosts
    // lets us use next/image (automatic AVIF/WebP + sizing) instead of raw <img>.
    images: {
        formats: ["image/avif", "image/webp"],
        /*
         * The hosts observed serving cover URLs. This list is the authority: `next/image` refuses any host that is not
         * here, so a newly appearing host fails loudly rather than silently.
         *
         * Both protocols are allowed because the payload mixes them: `rss.sfacg.com` returns
         * `https://` while `e1.kuangxiangit.com` returns `http://`. Restricting to `https` made
         * every cover from the http-only hosts fail the optimiser with a 400.
         */
        remotePatterns: [
            { protocol: "https", hostname: "index.tsyuri.com" },
            { protocol: "https", hostname: "**.kuangxiangit.com" },
            { protocol: "http", hostname: "**.kuangxiangit.com" },
            { protocol: "https", hostname: "**.sfacg.com" },
            { protocol: "https", hostname: "**.fqnovelpic.com" },
            { protocol: "https", hostname: "img.ciyuanji.com" },
        ],
    },
};

export default nextConfig;
