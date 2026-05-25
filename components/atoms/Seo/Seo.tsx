import { NextSeo } from "next-seo";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://andreaagostini.com";

export type SeoProps = {
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  nofollow?: boolean;
  noindex?: boolean;
  seoImage?: {
    url: string;
    width?: number;
    height?: number;
  };
};

const Seo: React.FC<SeoProps> = ({
  seoDescription,
  seoTitle,
  seoImage,
  canonicalUrl,
  nofollow,
  noindex,
}) => {
  const ogImage = seoImage
    ? { url: seoImage.url, width: seoImage.width, height: seoImage.height, alt: seoTitle }
    : { url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: seoTitle };

  return (
    <NextSeo
      canonical={canonicalUrl}
      description={seoDescription}
      noindex={noindex ?? false}
      nofollow={nofollow ?? false}
      title={seoTitle}
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
