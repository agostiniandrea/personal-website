"use client";

import { useState } from "react";
import { InstagramPost } from "@components/molecules";
import { InstagramMedia } from "@lib/types/instagram";
import { isTouchDevice } from "@lib/utils/isTouchDevice";
import styled from "styled-components";

type InstagramFeedProps = {
  igData: InstagramMedia[];
};

const InstagramFeed: React.FC<InstagramFeedProps> = ({ igData }) => {
  const [hovered, setHovered] = useState(-1);

  if (!igData || igData.length === 0) {
    return null;
  }

  return (
    <StyledInstagramGrid>
      {igData.slice(0, 24).map((media: InstagramMedia, i: number) => (
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
      ))}
    </StyledInstagramGrid>
  );
};

const StyledInstagramGrid = styled.div`
  background: white;
  border-top: 3px solid white;
  display: grid;
  gap: 3px;
  grid-template-columns: repeat(2, 1fr);

  @media (min-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

export default InstagramFeed;
