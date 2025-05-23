/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
    }
    return config
  },
}

module.exports = nextConfig