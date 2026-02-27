/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: true,
  },
  turbopack: {},
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
    }
    return config
  },
}

module.exports = nextConfig