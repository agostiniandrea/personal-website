/* eslint-disable @next/next/no-sync-scripts */
import { TPageFields } from "@lib/utils/cms/getPageContent";
import { NextSeo } from "next-seo";

type SeoProps = Omit<TPageFields, "modules" | "name" | "uid">;

const Seo: React.FC<SeoProps> = ({
  seoDescription,
  seoTitle,
  /* nofollow,
  noindex,
  seoImage, */
}) => {
  return (
    <NextSeo
      description={seoDescription}
      /* nofollow={nofollow}
      noindex={noindex} */
      title={seoTitle}
      openGraph={{
        description: seoDescription,
        /* ...(seoImage && { images: [seoImage] }), */
      }}
    />
  );
};

export default Seo;
