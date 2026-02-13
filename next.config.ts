import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {},
  turbopack: {
    // Ensuring an absolute path for Turbopack root to avoid multi-root workspace detection issues
    root: typeof process !== 'undefined' ? process.cwd() : "./",
  },
};

export default nextConfig;
