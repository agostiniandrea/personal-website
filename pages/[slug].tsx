import { Seo } from "@components/atoms";
import { SiteHeader, SiteFooter } from "@components/cms";
import { Flex, Skeleton } from "@components/ions";
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
import { useRouter } from "next/router";
import styled from "styled-components";

type TPage = {
  page: TPageFields;
  header: TSiteHeaderData | null;
  footer: TSiteFooterData | null;
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
    props: { page, header, footer },
    revalidate: 60,
  };
}

export const getStaticPaths = async () => {
  const slugs = await getPaths(PAGE_TYPES.PAGE_DETAIL);

  return {
    paths: slugs.map((x) => ({ params: { slug: x.slug } })),
    fallback: "blocking",
  };
};

export default function Pages({ page, header, footer }: TPage) {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agostiniandrea.vercel.app";
  const canonicalUrl = page?.uid ? `${siteUrl}/${page.uid}` : undefined;

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
        canonicalUrl={canonicalUrl}
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
