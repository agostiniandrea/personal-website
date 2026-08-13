import { config } from "dotenv";

// Load environment variables from .env.local file
config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "development",
    // "1" only on a real Vercel deploy; gates the Vercel analytics scripts so
    // they aren't requested off-platform (they 404 on localhost/CI).
    NEXT_PUBLIC_VERCEL: process.env.VERCEL ?? "",
  },
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
    ],
    // Optimize images for better performance
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000, // 30 days — images from Contentful rarely change
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
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
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
  turbopack: {},
  async redirects() {
    /* The site is one page, but its sections were once reachable as paths and
       Google still has some of them. Three redirected and the rest answered
       404, which is why Search Console reported both a redirect and a
       not-found reason for the same class of URL.

       Every section now lands on its own anchor rather than the top of the
       page, so an old link still takes you where it promised.

       Deliberately temporary: /projects and friends are exactly the paths a
       future case-study page would claim, and a permanent redirect sits in
       browser caches long after the config changes. Google not indexing them
       is the wanted outcome either way. */
    const sections = [
      "about",
      "beyond-code",
      "experience",
      "forest",
      "journey",
      "projects",
      "skills",
      "sustainability",
    ].map((id) => ({
      source: `/${id}`,
      destination: `/#${id}`,
      permanent: false,
    }));

    return [
      ...sections,
      { source: "/contact", destination: "/", permanent: true },
      /* The Pages Router answers /index as well as /, with byte-identical
         output. No `locale: false` here: Next normalises an incoming path to
         the locale-prefixed form before matching, so the unprefixed source
         never fires.

         /en is the other duplicate and is deliberately NOT redirected. Next's
         i18n serves the default locale at / while representing it internally
         as /en, so a redirect on /en catches the home page itself and loops it
         onto itself — verified, it 308s / to / forever. Fixing it would take
         middleware on every request to inspect the raw URL, which is a real
         cost for a duplicate the canonical tag already resolves. */
      { source: "/index", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
