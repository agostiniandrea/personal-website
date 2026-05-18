import { Seo } from "@components/atoms";
import { SiteHeader, SiteFooter } from "@components/cms";
import {
  TSiteHeaderData,
  TSiteFooterData,
  getSiteHeaderContent,
  getSiteFooterContent,
} from "@lib/utils/cms";
import { GetStaticPropsResult } from "next";
import styled from "styled-components";

type T404 = {
  header: TSiteHeaderData | null;
  footer: TSiteFooterData | null;
};

const Wrapper = styled.main`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 4rem 2rem;
`;

const Heading = styled.h1`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  text-align: center;
`;

export async function getStaticProps(): Promise<GetStaticPropsResult<T404>> {
  const [header, footer] = await Promise.all([
    getSiteHeaderContent(),
    getSiteFooterContent(),
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
        <Heading>404 — Page not found</Heading>
      </Wrapper>
      <SiteFooter {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })} />
    </>
  );
}
