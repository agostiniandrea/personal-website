import React from 'react';
import styled from 'styled-components';
import Link from '../../ions/Link';
import { useMedia } from '../../../lib/utils/useMedia';

export interface HeadingBoxProps {
  heading: string | null;
  description: string | null;
  preHeading: string | null;
  cta?: {
    label: string;
    url: string;
  };
}

const HeadingBoxContainer = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background: ${({theme}) => theme.colors.background};
  border-radius: ${({theme}) => theme.radii.xs};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: ${({theme}) => theme.breakpoints.mobile}) {
    padding: 1rem;
  }
`;

const Title = styled.h2`
  color: ${({theme}) => theme.colors.headline};
  font-size: ${({theme}) => theme.fontSizes['2xl']};
  font-family: ${({theme}) => theme.fontFamilies.heading};
  line-height: ${({theme}) => theme.lineHeights.heading};
  margin: 0;

  @media (max-width: ${({theme}) => theme.breakpoints.mobile}) {
    font-size: ${({theme}) => theme.fontSizes.xl};
  }
`;

const Description = styled.p<{ $hideDescription?: boolean }>`
  color: ${({theme}) => theme.colors.paragraph};
  font-size: ${({theme}) => theme.fontSizes.md};
  font-family: ${({theme}) => theme.fontFamilies.body};
  line-height: ${({theme}) => theme.lineHeights.regular};
  margin: 0;
  opacity: ${({ $hideDescription }) => ($hideDescription ? 0 : 1)};
  transition: opacity 0.3s ease-in-out;

  @media (max-width: ${({theme}) => theme.breakpoints.mobile}) {
    font-size: ${({theme}) => theme.fontSizes.sm};
  }
`;

const PreHeading = styled.span`
  color: ${({theme}) => theme.colors.paragraph};
  font-size: ${({theme}) => theme.fontSizes.md};
  font-family: ${({theme}) => theme.fontFamilies.body};
  line-height: ${({theme}) => theme.lineHeights.regular};
  margin: 0;
`;

const HeadingBox: React.FC<HeadingBoxProps> = ({
  heading,
  description,
  preHeading,
  cta,
}) => {
  const { isMobile } = useMedia();

  return (
    <HeadingBoxContainer 
      role="region"
      aria-label="Heading Box"
    >
      {preHeading && (
        <PreHeading id="pre-heading">
          {preHeading}
        </PreHeading>
      )}
      {heading && (
        <Title id="heading-title">
          {heading}
        </Title>
      )}
      {description && (
        <Description 
          id="heading-description"
          $hideDescription={isMobile}
        >
          {description}
        </Description>
      )}
      {cta && (
        <Link
          href={cta.url}
          aria-label={cta.label}
          styles={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--button)',
            color: 'var(--button_text)',
            borderRadius: 'var(--radii-xs)',
            textDecoration: 'none',
          }}
        >
          {cta.label}
        </Link>
      )}
    </HeadingBoxContainer>
  );
};

export default HeadingBox;
