import { Seo } from "@components/atoms";
import { SiteHeader, SiteFooter } from "@components/cms";
import { ModuleRenderer } from "@components/organisms";
import {
  TPageFields,
  TSiteHeaderData,
  TSiteFooterData,
  getPageContent,
  getPaths,
  getSiteHeaderContent,
  getSiteFooterContent,
} from "@lib/utils/cms";
import { PAGE_TYPES } from "@constants";
import { GetStaticPropsContext, GetStaticPropsResult } from "next";

type TPage = {
  page: TPageFields;
  header: TSiteHeaderData | null;
  footer: TSiteFooterData | null;
};

export async function getStaticProps(
  props: GetStaticPropsContext<{ slug: string }>,
): Promise<GetStaticPropsResult<TPage>> {
  const params = await props.params;

  const path = params?.slug || "";

  const [page, header, footer] = await Promise.all([
    getPageContent(PAGE_TYPES.PAGE_DETAIL, path),
    getSiteHeaderContent(),
    getSiteFooterContent(),
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
    revalidate: 60,
  };
}

export const getStaticPaths = async () => {
  const slugs = await getPaths(PAGE_TYPES.PAGE_DETAIL);

  const paths = slugs.map((x) => {
    return {
      params: {
        slug: x.slug,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export default function Pages({ page, header, footer }: TPage) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agostiniandrea.vercel.app";
  const canonicalUrl = page?.uid ? `${siteUrl}/${page.uid}` : undefined;

  return (
    <>
      <Seo
        canonicalUrl={canonicalUrl}
        seoDescription={page?.seoDescription}
        seoTitle={page?.seoTitle}
      />
      {header && <SiteHeader {...header} />}
      <ModuleRenderer components={page?.modules} />
      <SiteFooter {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })} />
    </>
  );
}
