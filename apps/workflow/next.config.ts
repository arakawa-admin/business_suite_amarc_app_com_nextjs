import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // iOS Safari対応のための設定
    async headers() {
        return [
            {
                source: '/auth/callback',
                headers: [
                {
                    key: 'Cache-Control',
                    value: 'no-cache, no-store, must-revalidate',
                },
                {
                    key: 'Pragma',
                    value: 'no-cache',
                },
                {
                    key: 'Expires',
                    value: '0',
                },
                {
                    key: 'Content-Type',
                    value: 'text/html; charset=utf-8',
                },
                ],
            },
        ];
    },
    // next/image R2対応
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.r2.cloudflarestorage.com",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
