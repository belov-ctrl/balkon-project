import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'balkonreshenie.ru',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;