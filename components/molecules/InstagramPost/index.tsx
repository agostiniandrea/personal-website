import { theme } from "@config/theme";
import { useMedia } from "@lib/utils/useMedia";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import styled from "styled-components";

const StyledVideo = styled.video`
    ::-webkit-media-controls-volume-slider {  
      display: none;
    }

    ::-webkit-media-controls-mute-button { 
      display: none;
    }
  `

type InstagramPostProps = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  media: any;
  style: any
};

const InstagramPost: React.FC<InstagramPostProps> = ({
  media,
  ...restProps
}) => {

  const [isHovered, setIsHovered] = React.useState(false)

  const { isMobile, isTablet, isDesktop}= useMedia()

  const height = isMobile ? 350 : isTablet ? 300 : 500

  return (
    <Link {...restProps} /* onMouseEnter={()=> setIsHovered(true)} onMouseLeave={()=> setIsHovered(false)} */ href={media.permalink} target="_blank" key={media.id} >
      <div style={{ display:'flex', height: `${height}px`, position:'relative', width: '100%'}}>
        {
          media.media_type === 'VIDEO' && <StyledVideo 
          poster={media.media_url}
          onMouseOver={event => event.target.play()}
          onMouseOut={event => {event.target.pause(); event.target.currentTime = 0;}}
          loop
          style={{ height: '100%', width: '100%', marginLeft: 'auto', marginRight: 'auto', objectFit: 'cover'}}  disablePictureInPicture controls controlsList="nodownload noplaybackrate nofullscreen">
            <source src={media.media_url} type="video/mp4" />
          </StyledVideo>
        }
        {
          media.media_type === 'IMAGE' && <Image fill style={{ marginLeft: 'auto', marginRight: 'auto', objectFit: 'cover'}} src={media.media_url} alt={media.caption} />
        }
        {
          media.media_type === 'CAROUSEL_ALBUM' && <Image fill style={{ marginLeft: 'auto', marginRight: 'auto', objectFit: 'cover'}} src={media.media_url} alt={media.caption} />
        }
        <div style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.03) 100%)",opacity: isHovered ? '0.75' : '0', transition: 'opacity 0.25s ease-in-out', position:'absolute', padding: '0.5rem', top: 0 }}>
          <p style={{ color: theme.colors.background, fontSize: isDesktop ? 'unset': '16px'}}>{media.caption}</p>
        </div>
      </div>
    </Link>
  );
}

export default InstagramPost;
