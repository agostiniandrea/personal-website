import { Seo } from "@components/atoms";
import { Container } from "@components/ions";
import { Footer, Header } from "@components/organisms";
import { theme } from "@config/theme";
import { PAGE_TYPES } from "@constants";
import { TPageFields, getPageContent } from "@lib/utils/cms";
import { useMedia } from "@lib/utils/useMedia";
import type { GetStaticPropsResult } from "next";

type TErrorPage = {
  page: TPageFields;
};

export async function getStaticProps(): Promise<GetStaticPropsResult<any>> {
  const page = await getPageContent(PAGE_TYPES.HOME, "");

  return { props: { page } };
}

export default function Error({ page }: TErrorPage) {
  const { isMobile } = useMedia();

  return (
    <>
      <Seo seoDescription={page.seoDescription} seoTitle={page.seoTitle} />
      <Header
        styles={{
          boxShadow: `0px -3px 0px 0px ${theme?.colors.headline} inset`,
        }}
      />
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
      <Footer />
    </>
  );
}
