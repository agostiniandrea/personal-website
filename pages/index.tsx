import NextHead from "next/head";
import { Seo } from "@components/atoms";
import { SiteHeader, SiteFooter } from "@components/cms";
import { ModuleRenderer, SectionDots } from "@components/organisms";
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
  locale: string;
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
      locale,
    },
    revalidate: 3600,
  };
}

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Andrea Agostini",
  jobTitle: "Senior Frontend Developer & Tech Lead",
  url: "https://agostiniandrea.vercel.app",
  email: "a.agostini92@gmail.com",
  sameAs: [
    "https://linkedin.com/in/agostiniandrea",
    "https://github.com/agostiniandrea",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangkok",
    addressCountry: "TH",
  },
};

export default function Home({ page, header, footer, locale }: THomepage) {
  return (
    <>
      <NextHead>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </NextHead>
      <Seo
        locale={locale}
        path="/"
        seoDescription={page.seoDescription}
        seoTitle={page.seoTitle}
      />
      {header && <SiteHeader {...header} />}
      <SectionDots />
      <main id="main-content">
        <ModuleRenderer components={page.modules} pageOrigin={PAGE_TYPES.HOME} />
      </main>
      <SiteFooter {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })} />
    </>
  );
}
