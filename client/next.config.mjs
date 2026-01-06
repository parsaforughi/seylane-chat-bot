/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use standalone output for deployment
  output: 'standalone',
  async rewrites() {
    // In production, proxy to same server
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'http://localhost:3000'
      : 'http://localhost:3000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: '/auth/:path*',
        destination: `${apiUrl}/auth/:path*`,
      },
      {
        source: '/webhook/:path*',
        destination: `${apiUrl}/webhook/:path*`,
      },
    ];
  },
};

export default nextConfig;

