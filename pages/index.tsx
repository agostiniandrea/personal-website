import { useEffect, useState } from "react";

import { Seo } from "@components/atoms";
import { InstagramPost } from "@components/molecules";
import { Footer, Header, ModuleRenderer } from "@components/organisms";
import { TPageFields, getPageContent } from "@lib/utils/cms";
import { isTouchDevice } from "@lib/utils/isTouchDevice";
import { useMedia } from "@lib/utils/useMedia";
import PAGE_TYPES from "constants/pageTypes";
import { GetStaticPropsResult } from "next";
import styled from "styled-components";

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
  const { isMobile, isTablet, isDesktop } = useMedia();

  const [igData, setIgData] = useState<any>(null);

  useEffect(() => {
    if (!igData) {
      fetch(`api/get-instagram-media`)
        .then((response) => response.json())
        .then(({ data }) => {
          setIgData(data);
        });
    }
  }, [igData]);

  const column = isMobile ? 2 : isTablet ? 3 : 5;

  const [hovered, setHovered] = useState(-1);

  let gridTemplateColumns = `repeat(${column}, ${100 / column}fr)`;

  return (
    <>
      <Seo seoDescription={page.seoDescription} seoTitle={page.seoTitle} />
      <Header />
      <ModuleRenderer components={page.modules} pageOrigin={PAGE_TYPES.HOME} />

      <div style={{ height: "58.5px", width: "100%" }}></div>

      <StyledDiv
        style={{
          background: "white",
          borderTop: "3px solid white",
          display: "grid",
          gridTemplateColumns,
          gridRowGap: "3px",
          gridColumnGap: "3px",
          transition: "all .25s",
        }}
      >
        {igData &&
          igData.slice(0, isDesktop ? 25 : 24).map((media: any, i: number) => {
            return (
              <InstagramPost
                style={{
                  ...(hovered !== -1 && {
                    opacity: hovered == i + 1 ? "1" : "0.66",
                  }),
                }}
                onMouseEnter={() => !isTouchDevice() && setHovered(i + 1)}
                onMouseLeave={() => !isTouchDevice() && setHovered(-1)}
                key={media.id}
                media={media}
              />
            );
          })}
      </StyledDiv>
      <Footer />
    </>
  );
}

const StyledDiv = styled.div``;
