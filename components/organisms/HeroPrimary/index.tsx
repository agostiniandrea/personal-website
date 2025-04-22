import React from 'react';
import styled from 'styled-components';
import Text from '../../ions/Text';
import Image from '../../ions/Image';

interface HeroPrimaryProps {
  titleId?: string;
  descriptionId?: string;
  className?: string;
  style?: React.CSSProperties;
}

const HeroContainer = styled.section`
  background: ${({theme}) => theme.colors.background};
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const HeroTitle = styled.h1`
  color: ${({theme}) => theme.colors.headline};
  font-size: 2.5rem;
  margin: 0;
  font-weight: bold;
  line-height: 1.2;
`;

const HeroDescription = styled(Text)`
  margin: 0;
  max-width: 60ch;
  font-size: 1.25rem;
`;

const HeroImage = styled(Image)`
  max-width: 600px;
  width: 100%;
  height: auto;
  margin: 0 auto;
  border-radius: ${({theme}) => theme.radii.sm};
`;

const HeroPrimary: React.FC<HeroPrimaryProps> = ({
  titleId = 'hero-title',
  descriptionId = 'hero-description',
  className,
  style,
}) => {
  return (
    <HeroContainer
      role="region"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={className}
      style={style}
    >
      <HeroContent>
        <HeroTitle id={titleId}>
          Our Blog
        </HeroTitle>
        <HeroDescription
          id={descriptionId}
          as="p"
          aria-label="Blog description"
        >
          Welcome to our blog, where we share our stories and experiences.
        </HeroDescription>
        <HeroImage
          src="/images/hero.jpg"
          alt="Blog hero image"
          longDescription="An image that captures the essence of our blog, showcasing meaningful moments from our stories"
          loading="eager"
          width={600}
          height={400}
        />
      </HeroContent>
    </HeroContainer>
  );
};

export default HeroPrimary; 