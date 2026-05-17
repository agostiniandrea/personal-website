import { Container } from "@components/ions";
import { SiteHeader, SiteFooter } from "@components/cms";
import {
  TSiteHeaderData,
  TSiteFooterData,
  getSiteHeaderContent,
  getSiteFooterContent,
} from "@lib/utils/cms";
import theme from "@config/theme";
import { useMedia } from "@lib/utils/useMedia";
import { GetStaticPropsResult } from "next";

type T404 = {
  header: TSiteHeaderData | null;
  footer: TSiteFooterData | null;
};

export async function getStaticProps(): Promise<GetStaticPropsResult<T404>> {
  const [header, footer] = await Promise.all([
    getSiteHeaderContent(),
    getSiteFooterContent(),
  ]);

  return {
    props: {
      header,
      footer,
    },
    revalidate: 3600,
  };
}

export default function Error({ header, footer }: T404) {
  const { isMobile } = useMedia();

  return (
    <>
      {header && <SiteHeader {...header} />}
      <Container
        verticalPadding
        styles={{
          height: isMobile ? "482px" : "",
        }}
      >
        <h1
          style={{
            color: theme?.colors.headline,
            textAlign: "center",
            fontSize: isMobile ? "40px" : "60px",
            marginTop: isMobile ? "auto" : "",
            marginBottom: isMobile ? "auto" : "",
            paddingTop: isMobile ? "" : "200px",
            paddingBottom: isMobile ? "" : "200px",
          }}
        >
          404 - Page not found
        </h1>
      </Container>
      <SiteFooter {...(footer ?? { socialLinks: [], copyrightName: "Andrea Agostini" })} />
    </>
  );
}
