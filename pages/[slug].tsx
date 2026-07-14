import { GetStaticPropsContext, GetStaticPropsResult } from "next";
import { useRouter } from "next/router";

import styled from "styled-components";

import { Seo } from "@components/atoms";
import { SiteFooter,SiteHeader } from "@components/cms";
import { Flex, Skeleton } from "@components/ions";
import { ModuleRenderer } from "@components/organisms";
import { PAGE_TYPES } from "@constants";
import {
  getPageContent,
  getPaths,
  getSiteFooterContent,
  getSiteHeaderContent,
  TPageFields,
  TSiteFooterData,
  TSiteHeaderData,
} from "@lib/utils/cms";

type TPage = {
  page: TPageFields;
  header: TSiteHeaderData | null;
  footer: TSiteFooterData | null;
  locale: string;
};

const SkeletonPage = styled(Flex).attrs({ direction: "column", gap: "xl" })`
  padding: ${({ theme }) => theme.space["6xl"]} ${({ theme }) => theme.space["2xl"]};
  max-width: 800px;
  margin: 0 auto;
`;

const PageMain = styled.main`
  padding-top: 4.5rem;
`;

export async function getStaticProps(
  props: GetStaticPropsContext<{ slug: string }>,
): Promise<GetStaticPropsResult<TPage>> {
  const params = await props.params;
  const path = params?.slug || "";
  const locale = props.locale || "en";

  const [page, header, footer] = await Promise.all([
    getPageContent(PAGE_TYPES.PAGE_DETAIL, path, locale),
    getSiteHeaderContent(locale),
    getSiteFooterContent(locale),
  ]);

  if (!page) {
    return { notFound: true };
  }

  return {
    props: { page, header, footer, locale },
    revalidate: 60,
  };
}

export const getStaticPaths = async () => {
  const locales = ["en", "it"];
  const allPaths = await Promise.all(
    locales.map(async (locale) => {
      const slugs = await getPaths(PAGE_TYPES.PAGE_DETAIL, locale);
      return slugs.map((x) => ({ params: { slug: x.slug }, locale }));
    }),
  );

  return {
    paths: allPaths.flat(),
    fallback: "blocking",
  };
};

export default function Pages({ page, header, footer, locale }: TPage) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <>
        {header && <SiteHeader {...header} />}
        <main id="main-content">
          <SkeletonPage>
            <Skeleton height="2.5rem" width="40%" />
            <Skeleton height="1rem" />
            <Skeleton height="1rem" width="90%" />
            <Skeleton height="1rem" width="75%" />
            <Skeleton height="1rem" width="85%" />
          </SkeletonPage>
        </main>
        <SiteFooter {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })} />
      </>
    );
  }

  return (
    <>
      <Seo
        locale={locale}
        path={page?.uid ? `/${page.uid}` : undefined}
        seoDescription={page?.seoDescription}
        seoTitle={page?.seoTitle}
      />
      {header && <SiteHeader {...header} />}
      <PageMain id="main-content">
        <ModuleRenderer components={page?.modules} />
      </PageMain>
      <SiteFooter {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })} />
    </>
  );
}
