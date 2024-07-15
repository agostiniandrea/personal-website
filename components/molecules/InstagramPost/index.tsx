import React from "react";

import { getImageSizes } from "@lib/utils/getImageSizes";
import { useMedia } from "@lib/utils/useMedia";
import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";

const StyledLink = styled(Link)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

type InstagramPostProps = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  media: any;
  style: any;
};

const InstagramPost: React.FC<InstagramPostProps> = ({
  media,
  style,
  ...restProps
}) => {
  const { isMobile, isTablet } = useMedia();

  const height = isMobile ? 350 : isTablet ? 300 : 500;

  return (
    <StyledLink
      {...restProps}
      style={{
        cursor: "pointer",
        display: "flex",
        height: `${height}px`,
        position: "relative",
        width: "100%",
        ...style,
      }}
      target="_blank"
      href={media.permalink}
      passHref
    >
      <Image
        fill
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          objectFit: "cover",
        }}
        src={media.thumbnail_url || media.media_url}
        alt={media.caption}
        sizes={getImageSizes(["50vw", "33vw", "33vw", "20vw", "20vw"])}
      />
    </StyledLink>
  );
};

export default InstagramPost;
