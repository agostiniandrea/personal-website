import { useState } from "react";

import { Seo } from "@components/atoms";
import { InstagramPost } from "@components/molecules";
import { Footer, Header, ModuleRenderer } from "@components/organisms";
import { TPageFields, getPageContent } from "@lib/utils/cms";
import { isTouchDevice } from "@lib/utils/isTouchDevice";
import { useMedia } from "@lib/utils/useMedia";
import PAGE_TYPES from "constants/pageTypes";
import { GetStaticPropsResult } from "next";
import styled from "styled-components";
import { getInstagramData } from "@lib/utils/instagram";

type THomepage = {
  page: TPageFields;
  igData?: any[] | null;
};

export async function getStaticProps(): Promise<
  GetStaticPropsResult<THomepage>
> {
  const page = await getPageContent(PAGE_TYPES.HOME, "");

  // Fetch Instagram data at build time with ISR
  const igData = await getInstagramData();

  return {
    props: {
      page,
      igData: igData || null,
    },
    revalidate: 3600, // Revalidate every hour (3600 seconds)
  };
}

export default function Home({ page, igData }: THomepage) {
  const { isMobile, isTablet, isDesktop } = useMedia();

  const column = isMobile ? 2 : isTablet ? 3 : 5;
  const [hovered, setHovered] = useState(-1);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agostiniandrea.vercel.app";

  return (
    <>
      <Seo
        canonicalUrl={`${siteUrl}/`}
        seoDescription={page.seoDescription}
        seoTitle={page.seoTitle}
      />
      <Header />
      <ModuleRenderer components={page.modules} pageOrigin={PAGE_TYPES.HOME} />

      <StyledSpacer />

      {igData && igData.length > 0 && (
        <StyledInstagramGrid $columns={column}>
          {igData.slice(0, isDesktop ? 25 : 24).map((media: any, i: number) => {
            return (
              <InstagramPost
                key={media.id}
                media={media}
                style={{
                  ...(hovered !== -1 && {
                    opacity: hovered === i ? "1" : "0.66",
                  }),
                }}
                onMouseEnter={() => !isTouchDevice() && setHovered(i)}
                onMouseLeave={() => !isTouchDevice() && setHovered(-1)}
              />
            );
          })}
        </StyledInstagramGrid>
      )}
      <Footer />
    </>
  );
}

const StyledSpacer = styled.div`
  height: 58.5px;
  width: 100%;
`;

const StyledInstagramGrid = styled.div<{ $columns: number }>`
  background: white;
  border-top: 3px solid white;
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, ${({ $columns }) =>
    100 / $columns}fr);
  grid-row-gap: 3px;
  grid-column-gap: 3px;
  transition: all 0.25s;
`;
