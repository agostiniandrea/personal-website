import { Seo } from "@components/atoms";
import { Footer, Header, ModuleRenderer } from "@components/organisms";
import { TPageFields, getPageContent } from "@lib/utils/cms";
import PAGE_TYPES from "constants/pageTypes";
import { GetStaticPropsResult } from "next";

type THomepage = {
  page: TPageFields;
};

export async function getStaticProps(): Promise<
  GetStaticPropsResult<THomepage>
> {
  const page = await getPageContent(PAGE_TYPES.HOME, "");

  return {
    props: {
      page,
    },
    revalidate: 60,
  };
}

export default function Home({ page }: THomepage) {
  return (
    <>
      <Seo seoDescription={page.seoDescription} seoTitle={page.seoTitle} />
      <Header />
      <ModuleRenderer components={page.modules} pageOrigin={PAGE_TYPES.HOME} />
      <Footer />
    </>
  );
}
