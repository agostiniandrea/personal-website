import { Footer, Header } from "@components/organisms";
import { PAGE_TYPES } from "@constants";
import type { GetStaticPropsResult } from "next";

import { Seo } from "@components/atoms";
import { Container } from "@components/ions";
import { TPageFields, getPageContent } from "@lib/utils/cms";

type TErrorPage = {
  page: TPageFields;
};

export async function getStaticProps(): Promise<GetStaticPropsResult<any>> {
  const page = await getPageContent(PAGE_TYPES.HOME, "");

  return { props: { page } };
}

export default function Error({ page }: TErrorPage) {
  return (
    <>
      <Seo seoDescription={page.seoDescription} seoTitle={page.seoTitle} />
      <Header />
      <Container verticalPadding>
        <section>
          <h1>404 - Page not found</h1>
        </section>
      </Container>
      <Footer />
    </>
  );
}
