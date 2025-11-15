/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    esmExternals: true,
    serverActions: { allowedOrigins: ['*'] },
  },
};

export default nextConfig;
