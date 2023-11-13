import { Seo } from "@components/atoms";
import { Container } from "@components/ions";
import { Footer, Header, ModuleRenderer } from "@components/organisms";
import { TPageFields, getPageContent, getPaths } from "@lib/utils/cms";
import PAGE_TYPES from "constants/pageTypes";
import { GetStaticPropsContext, GetStaticPropsResult } from "next";

type TPage = {
  page: TPageFields;
};

export async function getStaticProps(
  props: GetStaticPropsContext<{ slug: string }>
): Promise<GetStaticPropsResult<TPage>> {
  const { params } = props;

  const path = params?.slug || "";

  const page = await getPageContent(PAGE_TYPES.PAGE_DETAIL, path);

  return {
    props: {
      page,
    },
    revalidate: 60,
  };
}

export const getStaticPaths = async () => {
  const slugs = await getPaths(PAGE_TYPES.PAGE_DETAIL);

  const paths = slugs.map((x) => {
    return {
      params: {
        slug: x.slug,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export default function Pages({ page }: TPage) {
  return (
    <>
      <Seo seoDescription={page?.seoDescription} seoTitle={page?.seoTitle} />
      <Header />
      <Container verticalPadding>
        <section>
          <h2>What is Lorem Ipsum?</h2>
          <p>
            {
              "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
            }
          </p>
        </section>
        <section>
          <h2>Why do we use it?</h2>
          <p>
            {
              "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
            }
          </p>
          <p>
            {
              "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
            }
          </p>
        </section>
        <section>
          <h2>What is Lorem Ipsum?</h2>
          <p>
            {
              "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
            }
          </p>
        </section>
        <section>
          <h2>Where can I get some?</h2>
          <p>
            {
              "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
            }
          </p>
        </section>
      </Container>
      <ModuleRenderer components={page?.modules} />
      <Footer />
    </>
  );
}
