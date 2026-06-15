import React from "react";
import styled from "styled-components";
import { Box, Container, Flex, Heading, Image, Link, Text } from "@components/ions";
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
  cvDownloadLabel?: string;
  cvDownloadUrl?: string;
}

const Section = styled.section`
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.space["5xl"]} 0;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    padding: 0;
  }
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

const CvLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.875rem 0;
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-decoration: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.paragraph};
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.headline};
    border-color: ${({ theme }) => theme.colors.headline};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
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
  cvDownloadLabel,
  cvDownloadUrl,
}) => {
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
              {cvDownloadLabel && cvDownloadUrl && (
                <CvLink href={cvDownloadUrl} download aria-label={cvDownloadLabel}>
                  ↓ {cvDownloadLabel}
                </CvLink>
              )}
            </Flex>
          </TextBlock>
          <PhotoWrapper>
            <Image
              src={image.url}
              alt={image.alt || personName}
              priority
              sizes={`(max-width: ${BREAKPOINTS.tablet}) 240px, 380px`}
            />
          </PhotoWrapper>
        </HeroGrid>
      </Container>
    </Section>
  );
};

export default HeroPortfolio;
