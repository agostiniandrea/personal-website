import { useRouter } from "next/router";

import styled from "styled-components";

import { Container } from "@components/ions";
import { BREAKPOINTS } from "@constants";
import { trackEvent } from "@lib/utils/analytics";
import { useI18n } from "@lib/utils/i18n";

export interface ForestTeaserProps {
  feedbackTrees?: number;
  totalTrees?: number;
}

const Root = styled.section`
  display: none;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: block;
    padding: ${({ theme }) => theme.space.xl} 0;
  }
`;

const Panel = styled.div`
  align-items: center;
  background: #dcebd7;
  border: 1px solid #0f766e;
  border-radius: ${({ theme }) => theme.radii.lg};
  color: #101812;
  display: flex;
  min-height: 250px;
  overflow: hidden;
  padding: clamp(2rem, 5vw, 4.5rem);
  position: relative;
`;

const Copy = styled.div`
  max-width: 720px;
  position: relative;
  z-index: 1;
`;

const Eyebrow = styled.p`
  color: #0f5f58;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.16em;
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const Heading = styled.h2`
  color: #101812;
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: clamp(1.75rem, 3vw, 2.75rem);
  line-height: ${({ theme }) => theme.lineHeights.tight};
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const Metric = styled.p`
  color: #253529;
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const Cta = styled.button`
  color: #0b615a;
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: 0;

  &:focus-visible {
    outline-color: #101812;
  }
`;

const Artwork = styled.svg`
  bottom: -58px;
  color: #0f766e;
  height: 310px;
  opacity: 0.22;
  position: absolute;
  right: -18px;
  width: 430px;
`;

const ForestTeaser: React.FC<ForestTeaserProps> = ({
  feedbackTrees = 0,
  totalTrees = 0,
}) => {
  const router = useRouter();
  const t = useI18n(router.locale);

  const openForest = () => {
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
        <Panel>
          <Copy>
            <Eyebrow>{t.forestInlineEyebrow}</Eyebrow>
            <Heading id="forest-teaser-heading">{t.forestInlineHeading}</Heading>
            <Metric>{t.forestInlineMetric(feedbackTrees, totalTrees)}</Metric>
            <Cta onClick={openForest}>{t.forestInlineCta} →</Cta>
          </Copy>
          <Artwork viewBox="0 0 430 310" fill="none" aria-hidden="true">
            <circle cx="320" cy="176" r="118" stroke="currentColor" strokeWidth="2" />
            <circle cx="320" cy="176" r="86" stroke="currentColor" strokeWidth="2" />
            <circle cx="320" cy="176" r="54" stroke="currentColor" strokeWidth="2" />
            <path d="M20 274C92 218 119 169 154 77M80 234c47-22 78-55 97-99M128 170c-14-28-12-54 5-78M145 117c28-4 48-20 61-47" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </Artwork>
        </Panel>
      </Container>
    </Root>
  );
};

export default ForestTeaser;
