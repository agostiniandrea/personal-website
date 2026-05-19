import { Seo } from "@components/atoms";
import { SiteHeader, SiteFooter } from "@components/cms";
import {
  TSiteHeaderData,
  TSiteFooterData,
  getSiteHeaderContent,
  getSiteFooterContent,
} from "@lib/utils/cms";
import { Box, Heading } from "@components/ions";
import { GetStaticPropsResult } from "next";
import styled from "styled-components";

type T404 = {
  header: TSiteHeaderData | null;
  footer: TSiteFooterData | null;
};

const Wrapper = styled(Box).attrs({ as: "main" })`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: ${({ theme }) => theme.space["4xl"]} ${({ theme }) => theme.space["2xl"]};
`;

const PageHeading = styled(Heading).attrs({ size: "display", as: "h1" })`
  font-size: clamp(2.5rem, 6vw, 4rem);
  text-align: center;
`;

export async function getStaticProps({ locale = "en" }: { locale?: string }): Promise<GetStaticPropsResult<T404>> {
  const [header, footer] = await Promise.all([
    getSiteHeaderContent(locale),
    getSiteFooterContent(locale),
  ]);

  return {
    props: { header, footer },
    revalidate: 3600,
  };
}

export default function Error({ header, footer }: T404) {
  return (
    <>
      <Seo seoTitle="404 — Page not found" seoDescription="The page you're looking for could not be found." />
      {header && <SiteHeader {...header} />}
      <Wrapper id="main-content">
        <PageHeading>404 — Page not found</PageHeading>
      </Wrapper>
      <SiteFooter {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })} />
    </>
  );
}
