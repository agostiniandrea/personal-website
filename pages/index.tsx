import { Seo } from "@components/atoms";
import { SiteHeader, SiteFooter } from "@components/cms";
import { InstagramFeed, ModuleRenderer } from "@components/organisms";
import { InstagramMedia } from "@lib/types/instagram";
import {
  TPageFields,
  TSiteHeaderData,
  TSiteFooterData,
  getPageContent,
  getSiteHeaderContent,
  getSiteFooterContent,
} from "@lib/utils/cms";
import { getInstagramData } from "@lib/utils/instagram";
import { PAGE_TYPES } from "@constants";
import { GetStaticPropsResult } from "next";

type THomepage = {
  page: TPageFields;
  igData?: InstagramMedia[] | null;
  header: TSiteHeaderData | null;
  footer: TSiteFooterData | null;
};

export async function getStaticProps(): Promise<
  GetStaticPropsResult<THomepage>
> {
  const [page, header, footer] = await Promise.all([
    getPageContent(PAGE_TYPES.HOME, ""),
    getSiteHeaderContent(),
    getSiteFooterContent(),
  ]);

  if (!page) {
    return {
      notFound: true,
    };
  }

  const igData = await getInstagramData();

  return {
    props: {
      page,
      igData: igData || null,
      header,
      footer,
    },
    revalidate: 3600,
  };
}

export default function Home({ page, igData, header, footer }: THomepage) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agostiniandrea.vercel.app";

  return (
    <>
      <Seo
        canonicalUrl={`${siteUrl}/`}
        seoDescription={page.seoDescription}
        seoTitle={page.seoTitle}
      />
      {header && <SiteHeader {...header} />}
      <ModuleRenderer components={page.modules} pageOrigin={PAGE_TYPES.HOME} />
      {igData && igData.length > 0 && <InstagramFeed igData={igData} />}
      <SiteFooter {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })} />
    </>
  );
}