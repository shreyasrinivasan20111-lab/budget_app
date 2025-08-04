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
      },
      {
        protocol: 'https',
        hostname: 'serpapi.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn1.gstatic.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn2.gstatic.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn3.gstatic.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.ebay.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.bestbuy.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.homedepot.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.rei.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.macys.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '*.nordstrom.com',
        port: '',
        pathname: '**',
      }
    ],
  },
};

export default nextConfig;
