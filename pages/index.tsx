import { Seo } from "@components/atoms";
import { Footer, Header, InstagramFeed, ModuleRenderer } from "@components/organisms";
import { InstagramMedia } from "@lib/types/instagram";
import { TPageFields, getPageContent } from "@lib/utils/cms";
import { getInstagramData } from "@lib/utils/instagram";
import { PAGE_TYPES } from "@constants";
import { GetStaticPropsResult } from "next";

type THomepage = {
  page: TPageFields;
  igData?: InstagramMedia[] | null;
};

export async function getStaticProps(): Promise<
  GetStaticPropsResult<THomepage>
> {
  const page = await getPageContent(PAGE_TYPES.HOME, "");

  if (!page) {
    return {
      // returns the default 404 page with a status code of 404
      notFound: true,
    };
  }

  // Fetch Instagram data at build time with ISR
  const igData = await getInstagramData();

  return {
    props: {
      page,
      igData: igData || null,
    },
    revalidate: 3600, // Revalidate every hour (3600 seconds)
  };
}

export default function Home({ page, igData }: THomepage) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agostiniandrea.vercel.app";

  return (
    <>
      <Seo
        canonicalUrl={`${siteUrl}/`}
        seoDescription={page.seoDescription}
        seoTitle={page.seoTitle}
      />
      <Header />
      <ModuleRenderer components={page.modules} pageOrigin={PAGE_TYPES.HOME} />
      {igData && igData.length > 0 && <InstagramFeed igData={igData} />}
      <Footer />
    </>
  );
}