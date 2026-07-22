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
    padding: ${({ theme }) => theme.space["3xl"]} 0;
  }
`;

/* Colours come from the theme tokens, which already resolve per colour scheme
   (prefers-color-scheme + the Storybook data-theme override), so this panel
   needs no palette of its own. */
const Panel = styled.div`
  align-items: center;
  background: ${({ theme }) =>
    `linear-gradient(
      112deg,
      ${tint(theme.colors.highlight, 8, theme.colors.background)} 0%,
      ${theme.colors.background} 58%,
      ${tint(theme.colors.highlight, 5, theme.colors.background)} 100%
    )`};
  border: 1px solid ${({ theme }) => alpha(theme.colors.highlight, 32)};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.headline};
  display: grid;
  grid-template-columns: minmax(0, 56%) minmax(0, 44%);
  height: clamp(420px, 35vw, 504px);
  overflow: hidden;
  padding: clamp(3.5rem, 4vw, 4.5rem);
  position: relative;
`;

const Copy = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 800px;
  position: relative;
  z-index: 1;
`;

const Eyebrow = styled.p`
  align-items: center;
  color: ${({ theme }) => theme.colors.highlight};
  display: flex;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  gap: ${({ theme }) => theme.space.sm};
  letter-spacing: 0.16em;
  margin-bottom: ${({ theme }) => theme.space["2xl"]};
  text-transform: uppercase;
`;

const Sprout = styled.svg`
  flex: 0 0 28px;
  height: 28px;
  width: 28px;
`;

const Heading = styled.h2`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: clamp(3.25rem, 3.5vw, 4rem);
  line-height: ${({ theme }) => theme.lineHeights.tight};
  margin-bottom: ${({ theme }) => theme.space["2xl"]};
`;

const Metric = styled.p`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  margin-bottom: ${({ theme }) => theme.space["2xl"]};
  white-space: nowrap;
`;

const Cta = styled.a`
  color: ${({ theme }) => theme.colors.highlight};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: 0;

  &:focus-visible {
    outline-color: ${({ theme }) => theme.colors.headline};
  }
`;

const Artwork = styled.div`
  -webkit-mask-image: url("/assets/forest-teaser-pattern.svg");
  -webkit-mask-position: right bottom;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: cover;
  background: ${({ theme }) => theme.colors.highlight};
  bottom: 0;
  height: 100%;
  inset-inline-end: 0;
  mask-image: url("/assets/forest-teaser-pattern.svg");
  mask-position: right bottom;
  mask-repeat: no-repeat;
  mask-size: cover;
  opacity: 0.18;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: min(44rem, 48%);
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
    document.getElementById("forest-impact")?.scrollIntoView({
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
            <Cta href="/#forest-impact" onClick={openForest}>
              {t.forestInlineCta} →
            </Cta>
          </Copy>
          <Artwork aria-hidden="true" data-testid="forest-teaser-artwork" />
        </Panel>
      </Container>
    </Root>
  );
};

export default ForestTeaser;
