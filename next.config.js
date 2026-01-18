/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  // Image optimization
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Environment variables (will be available in browser)
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_PREMIUM_CHAPTER_PRICE: process.env.NEXT_PUBLIC_PREMIUM_CHAPTER_PRICE || '10',
  },
}

module.exports = nextConfig
