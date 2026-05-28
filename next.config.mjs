import { config } from 'dotenv';

// Load environment variables from .env.local file
config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  i18n: {
    locales: ["en", "it"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ctfassets.net",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
    ],
    // Optimize images for better performance
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
    // Enable image optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compiler: {
    styledComponents: {
      ssr: true,
      displayName: process.env.NODE_ENV !== "production",
    },
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  // Enable compression
  compress: true,
  // Reduce bundle size by excluding unnecessary polyfills
  experimental: {
    optimizePackageImports: [
      "@vercel/analytics",
      "@vercel/speed-insights",
      "next-seo",
    ],
  },
  // Optimize webpack bundle
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Tree shake unused code
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
    }
    return config;
  },
};

export default nextConfig;
