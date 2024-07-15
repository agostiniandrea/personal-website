import { useEffect, useState } from "react";

import { Seo } from "@components/atoms";
import { InstagramPost } from "@components/molecules";
import { Footer, Header, ModuleRenderer } from "@components/organisms";
import { isTouchDevice } from "@lib/utils/isTouchDevice";
import { TPageFields, getPageContent } from "@lib/utils/cms";
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

  const group1 = [1, 6, 11, 16, 21];
  const group2 = [2, 7, 12, 17, 22];
  const group3 = [3, 8, 13, 18, 23];
  const group4 = [4, 9, 14, 19, 24];
  const group5 = [5, 10, 15, 20, 25];

  if (group1.includes(hovered)) {
    gridTemplateColumns = `${100 / 4}fr ${100 / 6}fr ${100 / 6}fr ${
      100 / 6
    }fr ${100 / 6}fr`;
  } else if (group2.includes(hovered)) {
    gridTemplateColumns = `${100 / 6}fr ${100 / 4}fr ${100 / 6}fr ${
      100 / 6
    }fr ${100 / 6}fr`;
  } else if (group3.includes(hovered)) {
    gridTemplateColumns = `${100 / 6}fr ${100 / 6}fr ${100 / 4}fr ${
      100 / 6
    }fr ${100 / 6}fr`;
  } else if (group4.includes(hovered)) {
    gridTemplateColumns = `${100 / 6}fr ${100 / 6}fr ${100 / 6}fr ${
      100 / 4
    }fr ${100 / 6}fr`;
  } else if (group5.includes(hovered)) {
    gridTemplateColumns = `${100 / 6}fr ${100 / 6}fr ${100 / 6}fr ${
      100 / 6
    }fr ${100 / 4}fr`;
  }

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
                    opacity: hovered == i + 1 ? "1" : "0.75",
                  }),
                }}
                onMouseEnter={() => !isTouchDevice && setHovered(i + 1)}
                onMouseLeave={() => !isTouchDevice && setHovered(-1)}
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
