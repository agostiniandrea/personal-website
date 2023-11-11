import { Seo } from "@components/atoms";
import { Footer, Header, ModuleRenderer } from "@components/organisms";
import getPageContent, { TPageFields } from "@lib/utils/cms/getPageContent";
import PAGES from "constants/pages";
import { GetStaticPropsResult } from "next";

type THomepage = {
  page: TPageFields;
};

export async function getStaticProps(): Promise<
  GetStaticPropsResult<THomepage>
> {
  const page = await getPageContent("pageLanding");

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
      <ModuleRenderer components={page.modules} pageOrigin={PAGES.HOME} />
      <Footer />
    </>
  );
}
