"use client";

import { useState } from "react";
import { InstagramPost } from "@components/molecules";
import { InstagramMedia } from "@lib/types/instagram";
import { isTouchDevice } from "@lib/utils/isTouchDevice";
import { useMedia } from "@lib/utils/useMedia";
import styled from "styled-components";

type InstagramFeedProps = {
  igData: InstagramMedia[];
};

const InstagramFeed: React.FC<InstagramFeedProps> = ({ igData }) => {
  const { isMobile, isTablet, isDesktop } = useMedia();
  const column = isMobile ? 2 : isTablet ? 3 : 5;
  const [hovered, setHovered] = useState(-1);

  if (!igData || igData.length === 0) {
    return null;
  }

  return (
    <StyledInstagramGrid $columns={column}>
      {igData.slice(0, isDesktop ? 25 : 24).map((media: InstagramMedia, i: number) => {
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
  );
};

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

export default InstagramFeed;

