import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'infinite-images-dev-349660737637.s3.eu-central-1.amazonaws.com',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
