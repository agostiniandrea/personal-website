import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";

import styled, { keyframes } from "styled-components";

import {
  Box,
  Container,
  Flex,
  Heading,
  Image,
  Link,
  Text,
} from "@components/ions";
import { BREAKPOINTS } from "@constants";
import { trackContactInteraction, trackEvent } from "@lib/utils/analytics";
import { useI18n } from "@lib/utils/i18n";
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
  padding-top: 5.5rem;
  position: relative;
  @media (min-width: ${BREAKPOINTS.tablet}) {
    min-height: 100svh;
    padding-bottom: 0;
    padding-top: 0;
  }
`;

const HeroGrid = styled(Flex)`
  align-items: center;
  display: grid;
  gap: ${({ theme }) => theme.space.xl};
  grid-template-areas:
    "copy"
    "photo"
    "actions";
  grid-template-columns: minmax(0, 1fr);

  @media (min-width: ${BREAKPOINTS.tablet}) {
    grid-template-areas:
      "copy photo"
      "actions photo";
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    gap: ${({ theme }) => theme.space["4xl"]};
  }
`;

const TextBlock = styled(Box)`
  flex: 1;
  grid-area: copy;
  text-align: left;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    text-align: left;
  }
`;

const Name = styled(Heading).attrs({ size: "display", as: "h1" })`
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  margin: 0 0 ${({ theme }) => theme.space.sm};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes["6xl"]};
    margin-bottom: 1rem;
  }
`;

const GreetingSpan = styled.span`
  color: ${({ theme }) => theme.colors.highlight};
  display: block;
  font-family: ${({ theme }) => theme.fontFamilies.default};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  letter-spacing: 0.2em;
  margin-bottom: ${({ theme }) => theme.space.sm};
  text-transform: uppercase;
`;

const Role = styled.p`
  color: ${({ theme }) => theme.colors.highlight};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  line-height: ${({ theme }) => theme.lineHeights.normal};
  margin: 0 0 ${({ theme }) => theme.space.md};

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  }
`;

const Tagline = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: 0;
  max-width: 500px;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin: 0;
  }
`;

const Actions = styled(Flex)`
  align-items: center;
  flex-direction: column;
  grid-area: actions;

  > a {
    min-width: 180px;
    text-align: center;
  }

  @media (min-width: ${BREAKPOINTS.tablet}) {
    align-items: flex-start;
    flex-direction: row;

    > a {
      min-width: 0;
    }
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

  @media (hover: hover) {
    &:hover {
      background: transparent;
      border-color: ${({ theme }) => theme.colors.highlight};
      color: ${({ theme }) => theme.colors.highlight};
    }
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
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  gap: 0.375rem;
  padding: 0.875rem 0;
  text-decoration: none;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;

  @media (hover: hover) {
    &:hover {
      border-color: ${({ theme }) => theme.colors.headline};
      color: ${({ theme }) => theme.colors.headline};
    }
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

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => theme.colors.highlight};
      color: ${({ theme }) => theme.colors.button_text};
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
  }
`;

const PhotoOuter = styled.div`
  background: linear-gradient(
    135deg,
    var(--color-ring-start),
    var(--color-ring-end)
  );
  border-radius: ${({ theme }) => theme.radii.rounded};
  flex-shrink: 0;
  grid-area: photo;
  height: 148px;
  justify-self: center;
  padding: 3px;
  width: 148px;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    height: 380px;
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

  @media (hover: hover) {
    &:hover {
      opacity: 1;
    }
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }

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
  const { locale } = useRouter();
  const t = useI18n(locale);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollDown = () => {
    document
      .getElementById("about")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
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
            </TextBlock>
            <Actions gap="lg" wrap="wrap">
              <PrimaryLink
                href={ctaPrimaryUrl}
                onClick={(e) => handleAnchorClick(e, ctaPrimaryUrl)}
              >
                {ctaPrimaryLabel}
              </PrimaryLink>
              {ctaSecondaryLabel && ctaSecondaryUrl && (
                <SecondaryLink
                  href={ctaSecondaryUrl}
                  onClick={(e) => {
                    handleAnchorClick(e, ctaSecondaryUrl);
                    trackContactInteraction(ctaSecondaryUrl, "hero");
                  }}
                >
                  {ctaSecondaryLabel}
                </SecondaryLink>
              )}
              {cvDownloadLabel && cvDownloadFile && (
                <CvLink
                  href={cvDownloadFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={cvDownloadLabel}
                  onClick={() =>
                    trackEvent("cv_downloaded", { locale: locale ?? "en" })
                  }
                >
                  <span aria-hidden="true">↓</span>
                  {cvDownloadLabel}
                </CvLink>
              )}
            </Actions>
            <PhotoOuter>
              <PhotoWrapper>
                <Image
                  src={contentfulImageUrl(image.url, {
                    width: 800,
                    height: 800,
                    focus: "face",
                  })}
                  alt={image.alt || personName}
                  priority
                  fetchPriority="high"
                  width={800}
                  height={800}
                  sizes={`(max-width: ${BREAKPOINTS.tablet}) 148px, 380px`}
                />
              </PhotoWrapper>
            </PhotoOuter>
          </HeroGrid>
        </Container>
        <ScrollHint
          $visible={!scrolled}
          onClick={scrollDown}
          aria-label={t.scrollDown}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </ScrollHint>
      </Section>
    </>
  );
};

export default HeroPortfolio;
