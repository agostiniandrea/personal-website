import NextHead from "next/head";
import { DefaultSeo } from "next-seo";

import configSEO from "@config/seo.json";

/**
 * Component for rendering the head section of the document.
 * This component includes the default SEO configuration and meta tags.
 */
const Head = () => {
  // Only Vercel preview deploys must stay out of the index; everything else
  // (production, local dev, CI) is indexable. Keyed off preview specifically so
  // the shipped page — and the Lighthouse CI build — score as crawlable.
  const isPreview = process.env.NEXT_PUBLIC_VERCEL_ENV === "preview";
  const robots = isPreview
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  return (
    <>
      <DefaultSeo {...configSEO} />
      <NextHead>
        <meta name="robots" content={robots} />
        <meta property="og:type" content="website" />
        <meta name="author" content="Andrea Agostini" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://images.ctfassets.net" />
        <link rel="dns-prefetch" href="https://images.ctfassets.net" />
        <link rel="manifest" href="/site.webmanifest" key="site-manifest" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Andrea Agostini" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="theme-color" content="#ffffff" />
      </NextHead>
    </>
  );
};

export default Head;
