import React from "react";

import { getImageSizes } from "@lib/utils/getImageSizes";
import { InstagramMedia } from "@lib/types/instagram";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

type InstagramPostProps = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  media: InstagramMedia;
  style?: React.CSSProperties;
};

const StyledLink = styled(Link)`
  cursor: pointer;
  display: flex;
  height: 350px;
  position: relative;
  transition: opacity 0.25s;
  width: 100%;

  @media (min-width: 600px) {
    height: 300px;
  }

  @media (min-width: 1200px) {
    height: 500px;
  }
`;

const InstagramPost: React.FC<InstagramPostProps> = ({
  media,
  style,
  ...restProps
}) => (
  <StyledLink
    {...restProps}
    style={style}
    target="_blank"
    href={media.permalink}
    passHref
  >
    <Image
      fill
      loading="lazy"
      style={{ objectFit: "cover" }}
      src={media.thumbnail_url || media.media_url || ""}
      alt={media.caption || "Instagram post"}
      sizes={getImageSizes(["50vw", "33vw", "33vw", "20vw", "20vw"])}
    />
  </StyledLink>
);

export default InstagramPost;
