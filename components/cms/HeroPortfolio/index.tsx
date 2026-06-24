import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { Box, Container, Flex, Heading, Image, Link, Text } from "@components/ions";
import { BREAKPOINTS } from "@constants";
import { contentfulImageUrl } from "@utils/contentfulImage";

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
  cvDownloadFile?: string;
}

const Section = styled.section`
  position: relative;
  display: flex;
  align-items: center;
  @media (min-width: ${BREAKPOINTS.tablet}) {
    min-height: 100svh;
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

const Name = styled(Heading).attrs({ size: "display", as: "h1" })`
  margin: 0 0 1rem;
`;

const GreetingSpan = styled.span`
  display: block;
  font-family: ${({ theme }) => theme.fontFamilies.default};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.paragraph};
  margin-bottom: ${({ theme }) => theme.space.lg};
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
  border: 2px solid transparent;
  border-radius: ${({ theme }) => theme.radii.xs};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background: transparent;
    border-color: ${({ theme }) => theme.colors.highlight};
    color: ${({ theme }) => theme.colors.highlight};
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

const PhotoOuter = styled.div`
  flex-shrink: 0;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(135deg, var(--color-ring-start), var(--color-ring-end));
  width: 240px;
  height: 240px;
  margin-top: ${({ theme }) => theme.space["2xl"]};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    width: 380px;
    height: 380px;
    margin-top: 0;
  }
`;

const PhotoWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
`;

const ScrollHint = styled.button<{ $visible: boolean }>`
  display: none;
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);

  @media (min-width: ${BREAKPOINTS.tablet}) {
    display: block;
  }
  background: none;
  border: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  padding: 0.5rem;
  opacity: ${({ $visible }) => ($visible ? 0.5 : 0)};
  transition: opacity 0.4s ease;
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  animation: ${bounce} 1.8s ease-in-out infinite;
  color: ${({ theme }) => theme.colors.highlight};

  &:hover { opacity: 0.9; }

  &:focus:not(:focus-visible) { outline: none; }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
    border-radius: 50%;
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
  cvDownloadFile,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollDown = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Section id="hero">
      <Container>
        <HeroGrid>
          <TextBlock>
            <Name>
              <GreetingSpan>{greeting}</GreetingSpan>
              {personName}
            </Name>
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
              {cvDownloadLabel && cvDownloadFile && (
                <CvLink href={cvDownloadFile} target="_blank" rel="noopener noreferrer" aria-label={cvDownloadLabel}>
                  ↓ {cvDownloadLabel}
                </CvLink>
              )}
            </Flex>
          </TextBlock>
          <PhotoOuter>
            <PhotoWrapper>
              <Image
                src={contentfulImageUrl(image.url, { width: 800, height: 800, focus: "face" })}
                alt={image.alt || personName}
                priority
                fetchPriority="high"
                width={800}
                height={800}
                sizes={`(max-width: ${BREAKPOINTS.tablet}) 240px, 380px`}
              />
            </PhotoWrapper>
          </PhotoOuter>
        </HeroGrid>
      </Container>
      <ScrollHint
        $visible={!scrolled}
        onClick={scrollDown}
        aria-label="Scroll down"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </ScrollHint>
    </Section>
  );
};

export default HeroPortfolio;
