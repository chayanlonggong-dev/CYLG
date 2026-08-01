import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React
  reactStrictMode: true,

  // Remove x-powered-by
  poweredByHeader: false,

  // Enable gzip / brotli compression
  compress: true,

  // Images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],

    formats: [
      "image/avif",
      "image/webp",
    ],

    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  // Turbopack
  turbopack: {
    root: process.cwd(),
  },

  async headers() {
    return [
      {
        source: "/(.*)",

        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default nextConfig;