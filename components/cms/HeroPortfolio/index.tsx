import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";

import styled, { keyframes } from "styled-components";

import { Box, Container, Heading, Image, Link, Text } from "@components/ions";
import { BREAKPOINTS, BREAKPOINTS_BELOW } from "@constants";
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
  padding-bottom: 40px;
  padding-top: 2rem;
  position: relative;

  /* the site header is fixed, so the hero has to start below it */
  @media (min-width: ${BREAKPOINTS.xTablet}) {
    padding-bottom: 2rem;
    padding-top: var(--site-header-height);
  }

  @media (min-width: ${BREAKPOINTS.tablet}) {
    min-height: 100svh;
    padding-bottom: 0;
  }
`;

const HeroGrid = styled.div`
  align-items: center;
  display: grid;
  gap: 0;
  grid-template-areas:
    "photo"
    "copy"
    "actions";
  grid-template-columns: minmax(0, 1fr);
  margin-inline: -4px;
  width: calc(100% + 8px);

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    align-items: center;
    column-gap: ${({ theme }) => theme.space["4xl"]};
    grid-template-areas:
      "copy photo"
      "actions photo";
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    margin-inline: 0;
    row-gap: ${({ theme }) => theme.space["2xl"]};
    width: 100%;
  }
`;

const TextBlock = styled(Box)`
  flex: 1;
  grid-area: copy;
  text-align: center;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    text-align: left;
  }
`;

const Name = styled(Heading).attrs({ size: "display", as: "h1" })`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: clamp(36px, 10vw, 44px);
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1.05;
  margin: 0 0 16px;
  white-space: nowrap;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    font-size: ${({ theme }) => theme.fontSizes["6xl"]};
    line-height: inherit;
    margin-bottom: ${({ theme }) => theme.space.lg};
    white-space: normal;
  }
`;

const GreetingSpan = styled.span`
  color: ${({ theme }) => theme.colors.highlight};
  display: block;
  font-family: ${({ theme }) => theme.fontFamilies.default};
  font-size: 14px;
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  letter-spacing: 0.18em;
  line-height: 20px;
  margin-bottom: 14px;
  text-transform: uppercase;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    font-size: ${({ theme }) => theme.fontSizes.xs};
    letter-spacing: 0.2em;
    line-height: inherit;
    margin-bottom: ${({ theme }) => theme.space.lg};
  }
`;

const Role = styled.p`
  color: ${({ theme }) => theme.colors.highlight};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: clamp(18px, 4.8vw, 22px);
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  line-height: 1.25;
  margin: 0 0 20px;

  @media (min-width: 390px) and (max-width: ${BREAKPOINTS_BELOW.xTablet}) {
    white-space: nowrap;
  }

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
    line-height: ${({ theme }) => theme.lineHeights.normal};
    margin-bottom: ${({ theme }) => theme.space["2xl"]};
    white-space: normal;
  }
`;

const Tagline = styled(Text)`
  font-size: 17px;
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  line-height: 1.55;
  margin: 0 auto 26px;
  margin-inline: auto;
  max-width: 36ch;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    line-height: ${({ theme }) => theme.lineHeights.relaxed};
    margin: 0;
    max-width: 500px;
  }
`;

const Actions = styled.div`
  align-items: center;
  column-gap: 12px;
  display: grid;
  grid-area: actions;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  justify-self: center;
  max-width: 390px;
  row-gap: 20px;
  width: 100%;

  @media (max-width: 359.98px) {
    grid-template-columns: minmax(0, 285px);
  }

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    align-items: flex-start;
    column-gap: ${({ theme }) => theme.space.lg};
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-self: stretch;
    max-width: none;
    row-gap: ${({ theme }) => theme.space.lg};
  }
`;

const PrimaryLink = styled(Link)`
  align-items: center;
  background: ${({ theme }) => theme.colors.button};
  border: 2px solid transparent;
  border-radius: ${({ theme }) => theme.radii.xs};
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.button_text};
  display: inline-flex;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  height: 56px;
  justify-content: center;
  max-width: none;
  min-width: 0;
  padding: 0 ${({ theme }) => theme.space.md};
  text-align: center;
  text-decoration: none;
  transition: all 0.2s ease;
  width: 100%;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    height: auto;
    padding: 0.75rem 2rem;
    width: auto;
  }

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

  @media (min-width: ${BREAKPOINTS.tablet}) {
    padding: 0.875rem 2rem;
  }
`;

const CvLink = styled.a`
  align-items: center;
  border-bottom: 0;
  color: ${({ theme }) => theme.colors.paragraph};
  display: inline-flex;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  gap: 0.375rem;
  grid-column: 1 / -1;
  justify-content: center;
  justify-self: center;
  margin-inline: auto;
  min-height: 44px;
  min-width: 0;
  padding: 0 0 9px;
  position: relative;
  text-decoration: none;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
  width: fit-content;

  &::after {
    background: currentColor;
    bottom: 0;
    content: "";
    height: 1px;
    left: 0;
    position: absolute;
    right: 0;
  }

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

  /* the actions row becomes a flex row here, so the CV link aligns with the
     buttons instead of being centred on its own line */
  @media (min-width: ${BREAKPOINTS.xTablet}) {
    justify-self: auto;
    margin-inline: 0;
  }

  @media (min-width: ${BREAKPOINTS.tablet}) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.paragraph};
    padding: 0;

    &::after {
      display: none;
    }
  }
`;

const SecondaryLink = styled(Link)`
  align-items: center;
  border: 2px solid ${({ theme }) => theme.colors.highlight};
  border-radius: ${({ theme }) => theme.radii.xs};
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.highlight};
  display: inline-flex;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  height: 56px;
  justify-content: center;
  max-width: none;
  min-width: 0;
  padding: 0 ${({ theme }) => theme.space.md};
  text-align: center;
  text-decoration: none;
  transition: all 0.2s ease;
  width: 100%;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    height: auto;
    padding: 0.75rem 2rem;
    width: auto;
  }

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

  @media (min-width: ${BREAKPOINTS.tablet}) {
    padding: 0.875rem 2rem;
  }
`;

const PhotoOuter = styled.div`
  background: ${({ theme }) => theme.colors.highlight};
  border-radius: ${({ theme }) => theme.radii.rounded};
  flex-shrink: 0;
  grid-area: photo;
  height: clamp(210px, 56vw, 240px);
  justify-self: center;
  margin-bottom: 28px;
  padding: 2px;
  width: clamp(210px, 56vw, 240px);

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    background: linear-gradient(
      135deg,
      var(--color-ring-start),
      var(--color-ring-end)
    );
    height: 380px;
    justify-self: end;
    margin-bottom: 0;
    padding: 3px;
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
                  sizes="(max-width: 767px) 56vw, (max-width: 1199px) 148px, 380px"
                />
              </PhotoWrapper>
            </PhotoOuter>
            <TextBlock>
              <Name>
                <GreetingSpan>{greeting}</GreetingSpan>
                {personName}
              </Name>
              <Role>{role}</Role>
              <Tagline variant="large">{tagline}</Tagline>
            </TextBlock>
            <Actions>
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
                  <span>{cvDownloadLabel}</span>
                </CvLink>
              )}
            </Actions>
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
