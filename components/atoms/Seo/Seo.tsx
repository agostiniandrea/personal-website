import { NextSeo } from "next-seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://agostiniandrea.dev";

const LOCALES = ["en", "it"] as const;

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
  seoImage?: {
    url: string;
    width?: number;
    height?: number;
  };
};

const localePath = (locale: string, path: string) =>
  locale === "en" ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;

const Seo: React.FC<SeoProps> = ({
  seoDescription,
  seoTitle,
  seoImage,
  canonicalUrl,
  locale,
  path,
  nofollow,
  noindex,
}) => {
  const ogImage = seoImage
    ? { url: seoImage.url, width: seoImage.width, height: seoImage.height, alt: seoTitle }
    : { url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: seoTitle };

  const canonical = locale && path ? localePath(locale, path) : canonicalUrl;

  const languageAlternates =
    locale && path
      ? [
          ...LOCALES.map((l) => ({ hrefLang: l, href: localePath(l, path) })),
          { hrefLang: "x-default", href: localePath("en", path) },
        ]
      : undefined;

  return (
    <NextSeo
      canonical={canonical}
      description={seoDescription}
      noindex={noindex ?? false}
      nofollow={nofollow ?? false}
      title={seoTitle}
      languageAlternates={languageAlternates}
      openGraph={{
        description: seoDescription,
        title: seoTitle,
        type: "website",
        images: [ogImage],
      }}
      twitter={{
        cardType: "summary_large_image",
      }}
    />
  );
};

export default Seo;
