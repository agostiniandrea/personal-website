import Head from "next/head";
import { NextSeo } from "next-seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://agostiniandrea.dev";

const LOCALES = ["en", "it"] as const;
const OG_LOCALES: Record<string, string> = { en: "en_US", it: "it_IT" };

export type SeoProps = {
  seoTitle?: string;
  seoDescription?: string;
  /** Pass locale + path instead of a pre-built canonicalUrl for automatic hreflang generation. */
  locale?: string;
  /** Absolute path without locale prefix, e.g. "/" or "/experience". */
  path?: string;
  /** Pre-built canonical URL — used only when locale/path are not provided. */
  canonicalUrl?: string;
  nofollow?: boolean;
  noindex?: boolean;
  ogImageAlt?: string;
  seoImage?: {
    url: string;
    width?: number;
    height?: number;
  };
};

/** @internal exported for unit testing */
export const localePath = (locale: string, path: string) =>
  locale === "en"
    ? `${SITE_URL}${path}`
    : `${SITE_URL}/${locale}${path}`.replace(/\/$/, "");

const Seo: React.FC<SeoProps> = ({
  seoDescription,
  seoTitle,
  seoImage,
  canonicalUrl,
  locale,
  ogImageAlt,
  path,
  nofollow,
  noindex,
}) => {
  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
  const resolvedOgAlt = ogImageAlt ?? seoTitle;
  const ogImage = seoImage
    ? {
        url: seoImage.url,
        width: seoImage.width,
        height: seoImage.height,
        alt: resolvedOgAlt,
      }
    : {
        url: `${SITE_URL}/api/og`,
        width: 1200,
        height: 630,
        alt: resolvedOgAlt,
      };

  const canonical = locale && path ? localePath(locale, path) : canonicalUrl;

  const languageAlternates =
    locale && path
      ? [
          ...LOCALES.map((l) => ({ hrefLang: l, href: localePath(l, path) })),
          { hrefLang: "x-default", href: localePath("en", path) },
        ]
      : undefined;

  return (
    <>
      <NextSeo
        canonical={canonical}
        description={seoDescription}
        noindex={noindex ?? !isProduction}
        nofollow={nofollow ?? !isProduction}
        title={seoTitle}
        languageAlternates={languageAlternates}
        openGraph={{
          description: seoDescription,
          locale: OG_LOCALES[locale ?? "en"] ?? OG_LOCALES.en,
          title: seoTitle,
          type: "website",
          images: [ogImage],
        }}
        twitter={{
          cardType: "summary_large_image",
        }}
      />
      <Head>
        {LOCALES.filter((l) => l !== (locale ?? "en")).map((l) => (
          <meta
            content={OG_LOCALES[l]}
            key={`og-locale-alternate-${l}`}
            property="og:locale:alternate"
          />
        ))}
      </Head>
    </>
  );
};

export default Seo;
