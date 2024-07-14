import React from "react";

import { theme } from "@config/theme";
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
  z-index: 1;
`;

const StyledVideo = styled.video`
  ::-webkit-media-controls-volume-slider {
    display: none;
  }

  ::-webkit-media-controls-mute-button {
    display: none;
  }
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
  const [isHovered] = React.useState(false);

  const { isMobile, isTablet, isDesktop } = useMedia();

  const height = isMobile ? 350 : isTablet ? 300 : 500;

  return (
    <div
      {...restProps}
      /* onMouseEnter={()=> setIsHovered(true)} onMouseLeave={()=> setIsHovered(false)} */ style={{
        cursor: "pointer",
        display: "flex",
        height: `${height}px`,
        position: "relative",
        width: "100%",
        ...style,
      }}
    >
      {media.media_type === "VIDEO" && (
        <StyledVideo
          poster={media.media_url}
          onMouseOver={(event) => (event.target as any).play()}
          onMouseOut={(event) => {
            (event.target as any).pause();
            (event.target as any).currentTime = 0;
          }}
          loop
          style={{
            height: "100%",
            width: "100%",
            marginLeft: "auto",
            marginRight: "auto",
            objectFit: "cover",
          }}
          disablePictureInPicture
          controls
          controlsList="nodownload noplaybackrate nofullscreen"
        >
          <source src={media.media_url} type="video/mp4" />
        </StyledVideo>
      )}
      {media.media_type === "IMAGE" && (
        <Image
          fill
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            objectFit: "cover",
          }}
          src={media.media_url}
          alt={media.caption}
        />
      )}
      {media.media_type === "CAROUSEL_ALBUM" && (
        <Image
          fill
          style={{
            marginLeft: "auto",
            marginRight: "auto",
            objectFit: "cover",
          }}
          src={media.media_url}
          alt={media.caption}
        />
      )}
      <div
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.03) 100%)",
          opacity: isHovered ? "0.75" : "0",
          transition: "opacity 0.25s ease-in-out",
          position: "absolute",
          padding: "0.5rem",
          top: 0,
        }}
      >
        <p
          style={{
            color: theme.colors.background,
            fontSize: isDesktop ? "unset" : "16px",
          }}
        >
          {media.caption}
        </p>
      </div>
      <StyledLink href={media.permalink} target="_blank" key={media.id} />
    </div>
  );
};

export default InstagramPost;
