import React, { useState } from "react";
import styled from "styled-components";
import { Box, Container, Flex, Heading, Image, Link, Skeleton, Text } from "@components/ions";
import { BREAKPOINTS } from "@constants";

export interface HeroPortfolioProps {
  greeting: string;
  personName: string;
  role: string;
  tagline: string;
  image: ImageProps;
  ctaPrimaryLabel: string;
  ctaPrimaryUrl: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryUrl?: string;
}

const Section = styled.section`
  min-height: calc(100svh - ${({ theme }) => theme.space["4xl"]});
  display: flex;
  align-items: center;
`;

const HeroGrid = styled(Flex)`
  flex-direction: column-reverse;
  gap: ${({ theme }) => theme.space["3xl"]};
  align-items: center;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    flex-direction: row;
    justify-content: space-between;
    gap: ${({ theme }) => theme.space["4xl"]};
  }
`;

const TextBlock = styled(Box)`
  flex: 1;
  text-align: center;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    text-align: left;
  }
`;

const Greeting = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.paragraph};
  margin: 0 0 ${({ theme }) => theme.space.lg};
`;

const Name = styled(Heading).attrs({ size: "display", as: "h1" })`
  margin: 0 0 1rem;
`;

const Role = styled.p`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  color: ${({ theme }) => theme.colors.highlight};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  margin: 0 0 ${({ theme }) => theme.space.xl};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  }
`;

const Tagline = styled(Text)`
  max-width: 500px;
  margin: 0 auto ${({ theme }) => theme.space["2xl"]};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    margin: 0 0 ${({ theme }) => theme.space["2xl"]};
  }
`;

const PrimaryLink = styled(Link)`
  display: inline-block;
  padding: 0.875rem 2rem;
  background: ${({ theme }) => theme.colors.button};
  color: ${({ theme }) => theme.colors.button_text};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border-radius: ${({ theme }) => theme.radii.xs};
  text-decoration: none;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.85;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.headline};
    outline-offset: 3px;
  }
`;

const SecondaryLink = styled(Link)`
  display: inline-block;
  padding: 0.875rem 2rem;
  border: 2px solid ${({ theme }) => theme.colors.highlight};
  color: ${({ theme }) => theme.colors.highlight};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.md};
  border-radius: ${({ theme }) => theme.radii.xs};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.highlight};
    color: ${({ theme }) => theme.colors.button_text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
  }
`;

const PhotoWrapper = styled.div`
  position: relative;
  width: 240px;
  height: 240px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.colors.highlight};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    width: 380px;
    height: 380px;
  }
`;

const FadingImage = styled(Image)<{ $loaded: boolean }>`
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 0.4s ease;
`;

const HeroPortfolio: React.FC<HeroPortfolioProps> = ({
  greeting,
  personName,
  role,
  tagline,
  image,
  ctaPrimaryLabel,
  ctaPrimaryUrl,
  ctaSecondaryLabel,
  ctaSecondaryUrl,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Section>
      <Container>
        <HeroGrid>
          <TextBlock>
            <Greeting>{greeting}</Greeting>
            <Name>{personName}</Name>
            <Role>{role}</Role>
            <Tagline variant="large">{tagline}</Tagline>
            <Flex
              gap="lg"
              wrap="wrap"
              justifyContent={["center", undefined, "flex-start"]}
            >
              <PrimaryLink href={ctaPrimaryUrl}>{ctaPrimaryLabel}</PrimaryLink>
              {ctaSecondaryLabel && ctaSecondaryUrl && (
                <SecondaryLink href={ctaSecondaryUrl}>
                  {ctaSecondaryLabel}
                </SecondaryLink>
              )}
            </Flex>
          </TextBlock>
          <PhotoWrapper
            style={{
              position: "relative",
              width: "240px",
              height: "240px",
              flexShrink: 0,
              borderRadius: "50%",
              overflow: "hidden",
            }}
          >
            {!imageLoaded && (
              <Skeleton
                borderRadius="50%"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              />
            )}
            <FadingImage
              src={image.url}
              alt={image.alt || personName}
              $loaded={imageLoaded}
              priority
              sizes={`(max-width: ${BREAKPOINTS.tablet}) 240px, 380px`}
              onLoad={() => setImageLoaded(true)}
            />
          </PhotoWrapper>
        </HeroGrid>
      </Container>
    </Section>
  );
};

export default HeroPortfolio;
