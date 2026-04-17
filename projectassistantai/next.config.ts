// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },

  // Image optimisation
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google avatars
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "www.projectassistantai.com.ng" },
    ],
  },

  // Webpack — fix for ws (WebSocket) in Node.js environments
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Prevent bundling of server-only modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },

  // Redirect /dashboard → role-based dashboard (also handled in middleware)
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/student/dashboard",
        permanent: false,
      },
    ];
  },

  // Headers for security (backup to middleware)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
