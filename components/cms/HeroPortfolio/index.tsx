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
  align-items: center;
  display: flex;
  padding-bottom: 2rem;
  padding-top: 3.5rem;
  position: relative;
  @media (min-width: ${BREAKPOINTS.tablet}) {
    min-height: 100svh;
    padding-bottom: 0;
    padding-top: 0;
  }
`;

const HeroGrid = styled(Flex)`
  align-items: center;
  flex-direction: column-reverse;
  gap: ${({ theme }) => theme.space["3xl"]};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    flex-direction: row;
    gap: ${({ theme }) => theme.space["4xl"]};
    justify-content: space-between;
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
  color: ${({ theme }) => theme.colors.paragraph};
  display: block;
  font-family: ${({ theme }) => theme.fontFamilies.default};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  letter-spacing: 0.15em;
  margin-bottom: ${({ theme }) => theme.space.lg};
  text-transform: uppercase;
`;

const Role = styled.p`
  color: ${({ theme }) => theme.colors.highlight};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  margin: 0 0 ${({ theme }) => theme.space.xl};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  }
`;

const Tagline = styled(Text)`
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: 0 auto ${({ theme }) => theme.space["2xl"]};
  max-width: 500px;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    margin: 0 0 ${({ theme }) => theme.space["2xl"]};
  }
`;

const PrimaryLink = styled(Link)`
  background: ${({ theme }) => theme.colors.button};
  border: 2px solid transparent;
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ theme }) => theme.colors.button_text};
  display: inline-block;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: 0.875rem 2rem;
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
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.paragraph};
  color: ${({ theme }) => theme.colors.paragraph};
  display: inline-flex;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  gap: 0.375rem;
  padding: 0.875rem 0;
  text-decoration: none;
  transition: color 0.2s ease, border-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.headline};
    color: ${({ theme }) => theme.colors.headline};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
  }
`;

const SecondaryLink = styled(Link)`
  border: 2px solid ${({ theme }) => theme.colors.highlight};
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ theme }) => theme.colors.highlight};
  display: inline-block;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: 0.875rem 2rem;
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
  background: linear-gradient(135deg, var(--color-ring-start), var(--color-ring-end));
  border-radius: ${({ theme }) => theme.radii.rounded};
  flex-shrink: 0;
  height: 240px;
  margin-top: ${({ theme }) => theme.space["2xl"]};
  padding: 3px;
  width: 240px;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    height: 380px;
    margin-top: 0;
    width: 380px;
  }
`;

const PhotoWrapper = styled.div`
  border-radius: ${({ theme }) => theme.radii.rounded};
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
`;

const ScrollHint = styled.button<{ $visible: boolean }>`
  bottom: 2rem;
  display: none;
  left: 50%;
  position: fixed;
  transform: translateX(-50%);

  @media (min-width: ${BREAKPOINTS.tablet}) {
    align-items: center;
    display: flex;
    justify-content: center;
  }
  -webkit-appearance: none;
  animation: ${bounce} 1.8s ease-in-out infinite;
  appearance: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.highlight};
  cursor: pointer;
  opacity: ${({ $visible }) => ($visible ? 0.6 : 0)};
  padding: ${({ theme }) => theme.space.sm};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  transition: opacity 0.4s ease;

  &:hover { opacity: 1; }

  &:focus:not(:focus-visible) { outline: none; }

  &:focus-visible {
    border-radius: ${({ theme }) => theme.radii.rounded};
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
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

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    const el = document.getElementById(href.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
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
              <PrimaryLink href={ctaPrimaryUrl} onClick={(e) => handleAnchorClick(e, ctaPrimaryUrl)}>{ctaPrimaryLabel}</PrimaryLink>
              {ctaSecondaryLabel && ctaSecondaryUrl && (
                <SecondaryLink href={ctaSecondaryUrl} onClick={(e) => handleAnchorClick(e, ctaSecondaryUrl)}>
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
    </>
  );
};

export default HeroPortfolio;
