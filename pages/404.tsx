import { Seo } from "@components/atoms";
import { SiteHeader, SiteFooter } from "@components/cms";
import { Box, Container, Heading, Link, Text } from "@components/ions";
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

const Wrapper = styled(Box).attrs({ as: "main" })`
  padding: calc(3.5rem + 6rem) 0 6rem;
`;

const Label = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  margin: 0 0 1.25rem;
`;

const PageHeading = styled(Heading).attrs({ size: "display", as: "h1" })`
  margin: 0 0 1.5rem;
`;

const Body = styled(Text)`
  max-width: 480px;
  line-height: ${({ theme }) => theme.lineHeights.loose};
  margin: 0 0 ${({ theme }) => theme.space["3xl"]};
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

export default function NotFound({ header, footer }: T404) {
  return (
    <>
      <Seo
        seoTitle="404 — Page not found"
        seoDescription="This page doesn't exist — but the rest of the site does."
      />
      {header && <SiteHeader {...header} />}
      <Wrapper id="main-content">
        <Container>
          <Label>404</Label>
          <PageHeading>Wrong turn.</PageHeading>
          <Body variant="large">
            This page doesn&apos;t exist — but that&apos;s fine. I&apos;ve made
            wrong turns before. They usually lead somewhere interesting.
          </Body>
          <Link href="/" ariaLabel="Back to homepage">
            ← Back home
          </Link>
        </Container>
      </Wrapper>
      <SiteFooter {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })} />
    </>
  );
}
