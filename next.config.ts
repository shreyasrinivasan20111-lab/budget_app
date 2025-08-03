import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.amazon.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.walmart.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.target.com',
        port: '',
        pathname: '**',
      }
    ],
  },
};

export default nextConfig;
