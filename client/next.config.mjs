/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  // Only use rewrites in development
  ...(process.env.NODE_ENV !== 'production' && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3000/api/:path*', // Proxy to backend
        },
        {
          source: '/auth/:path*',
          destination: 'http://localhost:3000/auth/:path*', // Proxy to backend
        },
      ];
    },
  }),
};

export default nextConfig;

