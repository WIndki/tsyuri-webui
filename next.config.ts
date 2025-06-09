import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    output: "export",
    async redirects() {
        return [
            {
                source: "/search",
                destination: "/",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
