import { useRouter } from "next/router";

import styled from "styled-components";

import { Container } from "@components/ions";
import { BREAKPOINTS } from "@constants";
import { trackEvent } from "@lib/utils/analytics";
import { alpha, tint } from "@lib/utils/color";
import { useI18n } from "@lib/utils/i18n";

export interface ForestTeaserProps {
  feedbackTrees?: number;
  totalTrees?: number;
}

const Root = styled.section`
  display: none;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: block;
    padding: ${({ theme }) => theme.space.md} 0;
  }
`;

/* Colours come from theme tokens (surfaceRaised gives the panel its lift over
   the page in both schemes); the subtle gradient keeps the base look. */
const Panel = styled.div`
  align-items: center;
  background: ${({ theme }) =>
    `linear-gradient(
      112deg,
      ${theme.colors.surfaceRaised} 0%,
      ${tint(theme.colors.highlight, 6, theme.colors.surfaceRaised)} 100%
    )`};
  border: 1px solid ${({ theme }) => alpha(theme.colors.highlight, 34)};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.headline};
  display: flex;
  height: clamp(420px, 35vw, 504px);
  overflow: hidden;
  padding: clamp(3.5rem, 4vw, 4.5rem) clamp(3rem, 4vw, 3.5rem);
  position: relative;
`;

const Copy = styled.div`
  max-width: 700px;
  position: relative;
  z-index: 1;
`;

const Eyebrow = styled.p`
  align-items: center;
  color: ${({ theme }) => theme.colors.highlight};
  display: flex;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  gap: ${({ theme }) => theme.space.sm};
  letter-spacing: 0.16em;
  margin-bottom: ${({ theme }) => theme.space.md};
  text-transform: uppercase;
`;

const Sprout = styled.svg`
  flex: 0 0 22px;
  height: 22px;
  width: 22px;
`;

const Heading = styled.h2`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: clamp(3.25rem, 3.5vw, 4rem);
  line-height: ${({ theme }) => theme.lineHeights.tight};
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const Metric = styled.p`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const Cta = styled.button`
  color: ${({ theme }) => theme.colors.highlight};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: 0;

  &:focus-visible {
    outline-color: ${({ theme }) => theme.colors.headline};
  }
`;

/* The botanical pattern ships as an external SVG used as a mask, so the
   artwork picks up the theme's highlight colour in both schemes. Per the
   design it bleeds to the panel's right edge at full height, with the whole
   drawing visible (contain) — branch on top, tree rings bottom-right — and
   its intensity comes from the per-scheme --artwork-opacity token. */
const Artwork = styled.div`
  -webkit-mask-image: url("/assets/forest-teaser-pattern.svg");
  -webkit-mask-position: right center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: auto 100%;
  background: ${({ theme }) => theme.colors.highlight};
  inset-block: 0;
  inset-inline-end: 0;
  /* auto 100% keeps the drawing at full panel height in every layout;
     contain would fit the width instead and leave gaps above and below.
     Right-anchored, so a narrow column crops the branch's left edge only. */
  mask-image: url("/assets/forest-teaser-pattern.svg");
  mask-position: right center;
  mask-repeat: no-repeat;
  mask-size: auto 100%;
  opacity: var(--artwork-opacity);
  pointer-events: none;
  position: absolute;
  width: min(38rem, 48%);
`;

const ForestTeaser: React.FC<ForestTeaserProps> = ({
  feedbackTrees = 0,
  totalTrees = 0,
}) => {
  const router = useRouter();
  const t = useI18n(router.locale);

  const openForest = () => {
    sessionStorage.setItem("forest-inline-teaser-engaged", "true");
    window.dispatchEvent(new Event("forest-inline-teaser-engaged"));
    trackEvent("forest_teaser_click", { locale: router.locale ?? "en" });
    document.getElementById("forest")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return (
    <Root aria-labelledby="forest-teaser-heading" data-testid="forest-teaser">
      <Container>
        <Panel data-testid="forest-teaser-panel">
          <Copy data-testid="forest-teaser-copy">
            <Eyebrow>
              <Sprout viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 21V10"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M12 12C8.3 12 5.5 9.7 5 6c3.9-.2 6.4 1.6 7 6Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 10c.7-4.4 3.2-6.6 7-6.9-.1 3.9-2.6 6.7-7 6.9Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </Sprout>
              {t.forestInlineEyebrow}
            </Eyebrow>
            <Heading id="forest-teaser-heading">
              {t.forestInlineHeading}
            </Heading>
            <Metric>{t.forestInlineMetric(feedbackTrees, totalTrees)}</Metric>
            <Cta onClick={openForest}>{t.forestInlineCta} →</Cta>
          </Copy>
          <Artwork aria-hidden="true" data-testid="forest-teaser-artwork" />
        </Panel>
      </Container>
    </Root>
  );
};

export default ForestTeaser;
