import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '83.222.18.44',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;