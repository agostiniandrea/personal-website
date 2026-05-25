import { Seo } from "@components/atoms";
import { SiteHeader, SiteFooter } from "@components/cms";
import { ModuleRenderer } from "@components/organisms";
import {
  TPageFields,
  TSiteHeaderData,
  TSiteFooterData,
  getPageContent,
  getSiteHeaderContent,
  getSiteFooterContent,
} from "@lib/utils/cms";
import { PAGE_TYPES } from "@constants";
import { GetStaticPropsResult } from "next";

type THomepage = {
  page: TPageFields;
  header: TSiteHeaderData | null;
  footer: TSiteFooterData | null;
};

export async function getStaticProps({ locale = "en" }: { locale?: string }): Promise<
  GetStaticPropsResult<THomepage>
> {
  const [page, header, footer] = await Promise.all([
    getPageContent(PAGE_TYPES.HOME, "", locale),
    getSiteHeaderContent(locale),
    getSiteFooterContent(locale),
  ]);

  if (!page) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      page,
      header,
      footer,
    },
    revalidate: 3600,
  };
}

export default function Home({ page, header, footer }: THomepage) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agostiniandrea.vercel.app";

  return (
    <>
      <Seo
        canonicalUrl={`${siteUrl}/`}
        seoDescription={page.seoDescription}
        seoTitle={page.seoTitle}
      />
      {header && <SiteHeader {...header} />}
      <main id="main-content">
        <ModuleRenderer components={page.modules} pageOrigin={PAGE_TYPES.HOME} />
      </main>
      <SiteFooter {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })} />
    </>
  );
}
