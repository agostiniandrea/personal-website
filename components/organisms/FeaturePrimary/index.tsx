import React from 'react';
import styled from 'styled-components';
import Text from '../../ions/Text';
import Image from '../../ions/Image';

interface FeaturePrimaryProps {
  titleId?: string;
  descriptionId?: string;
  className?: string;
  style?: React.CSSProperties;
}

const FeatureContainer = styled.section`
  background: ${({theme}) => theme.colors.background};
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
`;

const FeatureContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`;

const FeatureTitle = styled.h2`
  color: ${({theme}) => theme.colors.headline};
  font-size: 2rem;
  margin: 0;
  font-weight: bold;
  line-height: 1.2;
`;

const FeatureDescription = styled(Text)`
  margin: 0;
  max-width: 60ch;
  font-size: 1.25rem;
`;

const FeatureImage = styled(Image)`
  max-width: 600px;
  width: 100%;
  height: auto;
  margin: 0 auto;
  border-radius: ${({theme}) => theme.radii.sm};
`;

const FeaturePrimary: React.FC<FeaturePrimaryProps> = ({
  titleId = 'feature-title',
  descriptionId = 'feature-description',
  className,
  style,
}) => {
  return (
    <FeatureContainer
      role="article"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={className}
      style={style}
    >
      <FeatureContent>
        <FeatureTitle id={titleId}>
          Our Stories
        </FeatureTitle>
        <FeatureDescription
          id={descriptionId}
          as="p"
          variant="large"
          aria-label="Stories description"
        >
          Discover our stories and experiences that we share with you.
        </FeatureDescription>
        <FeatureImage
          src="/images/feature.jpg"
          alt="Collection of our stories"
          longDescription="A visual gallery representing the various stories and experiences we share in the blog"
          loading="lazy"
          width={600}
          height={400}
        />
      </FeatureContent>
    </FeatureContainer>
  );
};

export default FeaturePrimary; 