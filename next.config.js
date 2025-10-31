import { config } from 'dotenv';
import { withSentryConfig } from "@sentry/nextjs";

// Load environment variables from .env.local file
config(); // This loads variables into process.env

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    // Enables the styled-components SWC transform
    styledComponents: true,
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"],
    } : false,
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  swcMinify: true,
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

const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  reactComponentAnnotation: {
    enabled: true,
  },
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
