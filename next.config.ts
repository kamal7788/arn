import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://example.com').hostname,
      },
    ],
  },
};

export default nextConfig;
