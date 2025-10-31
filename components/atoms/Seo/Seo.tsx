import { TPageFields } from "@lib/utils/cms";
import { NextSeo } from "next-seo";

type SeoProps = Omit<TPageFields, "modules" | "name" | "uid"> & {
  canonicalUrl?: string;
};

const Seo: React.FC<SeoProps> = ({
  seoDescription,
  seoTitle,
  canonicalUrl,
  /* nofollow,
  noindex,
  seoImage, */
}) => {
  return (
    <NextSeo
      canonical={canonicalUrl}
      description={seoDescription}
      noindex={false}
      nofollow={false}
      title={seoTitle}
      openGraph={{
        description: seoDescription,
        title: seoTitle,
        type: "website",
        /* ...(seoImage && { images: [seoImage] }), */
      }}
      twitter={{
        cardType: "summary_large_image",
      }}
    />
  );
};

export default Seo;
