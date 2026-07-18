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
    padding: ${({ theme }) => theme.space.md} 0;
  }
`;

const Panel = styled.div`
  --teaser-art: #0f766e;
  --teaser-ink: #0a0a0f;
  --teaser-muted: #485650;
  --teaser-surface-end: #dfeadd;
  --teaser-surface-start: #eaf1e6;

  align-items: center;
  background: linear-gradient(
    112deg,
    var(--teaser-surface-start) 0%,
    #e6eee2 58%,
    var(--teaser-surface-end) 100%
  );
  border: 1px solid rgba(15, 118, 110, 0.34);
  border-radius: ${({ theme }) => theme.radii.lg};
  box-sizing: border-box;
  box-shadow: 0 18px 48px rgba(31, 55, 47, 0.08);
  color: var(--teaser-ink);
  display: grid;
  grid-template-columns: minmax(0, 65%) minmax(0, 35%);
  height: clamp(260px, 21vw, 276px);
  overflow: hidden;
  padding: clamp(2.5rem, 3.5vw, 3rem) clamp(3rem, 4vw, 3.5rem);
  position: relative;

  @media (prefers-color-scheme: dark) {
    --teaser-art: #5eead4;
    --teaser-ink: #f5faf7;
    --teaser-muted: #c4d3cd;
    --teaser-surface-end: #19362f;
    --teaser-surface-start: #203c34;

    border-color: rgba(94, 234, 212, 0.3);
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.18);
  }

  :root[data-theme="light"] & {
    --teaser-art: #0f766e;
    --teaser-ink: #0a0a0f;
    --teaser-muted: #485650;
    --teaser-surface-end: #dfeadd;
    --teaser-surface-start: #eaf1e6;
  }

  :root[data-theme="dark"] & {
    --teaser-art: #5eead4;
    --teaser-ink: #f5faf7;
    --teaser-muted: #c4d3cd;
    --teaser-surface-end: #19362f;
    --teaser-surface-start: #203c34;
  }
`;

const Copy = styled.div`
  max-width: 700px;
  position: relative;
  z-index: 1;
`;

const Eyebrow = styled.p`
  align-items: center;
  color: var(--teaser-art);
  display: flex;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  gap: ${({ theme }) => theme.space.sm};
  letter-spacing: 0.16em;
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const Sprout = styled.svg`
  flex: 0 0 22px;
  height: 22px;
  width: 22px;
`;

const Heading = styled.h2`
  color: var(--teaser-ink);
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: clamp(2.25rem, calc(2vw + 1.25rem), 2.75rem);
  line-height: ${({ theme }) => theme.lineHeights.tight};
  margin-bottom: ${({ theme }) => theme.space.md};
`;

const Metric = styled.p`
  color: var(--teaser-muted);
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-bottom: ${({ theme }) => theme.space.xl};
`;

const Cta = styled.button`
  color: var(--teaser-art);
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: 0;

  &:focus-visible {
    outline-color: var(--teaser-ink);
  }
`;

const ArtworkColumn = styled.div`
  align-self: stretch;
  min-width: 0;
  overflow: hidden;
  position: relative;
`;

const Artwork = styled.svg`
  color: var(--teaser-art);
  height: 100%;
  inset: 0;
  opacity: 0.1;
  position: absolute;
  width: 100%;
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
                <path d="M12 21V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M12 12C8.3 12 5.5 9.7 5 6c3.9-.2 6.4 1.6 7 6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M12 10c.7-4.4 3.2-6.6 7-6.9-.1 3.9-2.6 6.7-7 6.9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              </Sprout>
              {t.forestInlineEyebrow}
            </Eyebrow>
            <Heading id="forest-teaser-heading">{t.forestInlineHeading}</Heading>
            <Metric>{t.forestInlineMetric(feedbackTrees, totalTrees)}</Metric>
            <Cta onClick={openForest}>{t.forestInlineCta} →</Cta>
          </Copy>
          <ArtworkColumn data-testid="forest-teaser-artwork">
          <Artwork viewBox="0 0 650 330" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
            <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M34 188c111-18 181-66 254-133 56-51 119-48 202-27 49 13 91 12 139-8" strokeWidth="2.2" />
              <path d="M168 132c-6-36 2-69 25-101M228 94c21-31 47-50 79-57M287 56c17 17 42 28 74 31M361 37c22 24 55 38 97 42M444 41c25-8 51-8 79 1M118 158c-24-3-49 2-74 16" strokeWidth="1.55" />

              <path d="M174 95c-26-9-43-31-42-59 28 1 48 18 42 59Z" />
              <path d="M177 91c-13-19-25-36-42-52M174 95c-2-22 4-42 19-64" strokeWidth="0.9" />
              <path d="M224 95c-2-29 12-52 39-66 9 28-4 54-39 66Z" />
              <path d="M226 91c13-21 24-38 34-57" strokeWidth="0.9" />
              <path d="M300 39c16-25 40-36 70-31-10 29-34 42-70 31Z" />
              <path d="M304 38c24-8 43-16 61-27" strokeWidth="0.9" />
              <path d="M353 86c25-14 51-11 75 7-20 22-47 22-75-7Z" />
              <path d="M358 85c24 2 44 5 65 8" strokeWidth="0.9" />
              <path d="M431 76c22-18 49-20 77-7-15 26-41 30-77 7Z" />
              <path d="M436 75c25-3 46-5 67-5" strokeWidth="0.9" />
              <path d="M501 41c13-25 35-39 65-39-5 29-26 46-65 39Z" />
              <path d="M506 39c21-12 39-23 55-34" strokeWidth="0.9" />
              <path d="M118 158c-28-17-54-16-80 2 18 25 45 24 80-2Z" />
              <path d="M112 157c-25 1-48 2-69 3" strokeWidth="0.9" />
              <path d="M82 177c-7 28 2 52 27 70 14-25 5-50-27-70Z" />
              <path d="M84 182c8 22 15 42 22 60" strokeWidth="0.9" />

              <path d="M418 332c-13-54 0-112 42-151 43-40 111-50 166-25 19 9 37 22 52 38" strokeWidth="1.2" />
              <path d="M437 332c-10-47 2-95 37-128 36-34 92-43 139-22 26 12 48 32 63 56" strokeWidth="1.1" />
              <path d="M458 332c-8-39 2-80 31-107 30-28 76-36 114-18 31 14 54 42 64 74" strokeWidth="1.05" />
              <path d="M480 332c-6-32 2-64 25-86 24-23 61-29 92-15 35 16 56 53 53 91" />
              <path d="M503 332c-4-24 2-49 20-65 18-17 46-22 69-11 28 13 43 44 35 74" />
              <path d="M527 332c-2-17 2-34 14-45 13-12 32-15 48-7 20 10 29 33 20 52" />
              <path d="M551 332c0-10 3-20 10-26 7-7 18-8 27-4 12 6 17 19 12 30" />
            </g>
          </Artwork>
          </ArtworkColumn>
        </Panel>
      </Container>
    </Root>
  );
};

export default ForestTeaser;
