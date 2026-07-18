import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import styled from "styled-components";

import { BREAKPOINTS } from "@constants";
import { trackEvent, trackOnce } from "@lib/utils/analytics";
import { useI18n } from "@lib/utils/i18n";

const Card = styled.aside`
  background: color-mix(
    in srgb,
    ${({ theme }) => theme.colors.background} 94%,
    ${({ theme }) => theme.colors.highlight}
  );
  border: 1px solid
    color-mix(in srgb, ${({ theme }) => theme.colors.highlight} 32%, transparent);
  border-radius: ${({ theme }) => theme.radii.lg};
  bottom: ${({ theme }) => theme.space.xl};
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.16);
  display: block;
  max-width: 340px;
  padding: ${({ theme }) => theme.space.lg};
  position: fixed;
  right: ${({ theme }) => theme.space.xl};
  z-index: 90;

  @media (max-width: 899.98px) {
    display: none;
  }
`;

const Header = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.space.md};
`;

const Icon = styled.span`
  align-items: center;
  background: ${({ theme }) => theme.colors.badgeBg};
  border-radius: ${({ theme }) => theme.radii.rounded};
  color: ${({ theme }) => theme.colors.highlight};
  display: flex;
  flex: 0 0 40px;
  height: 40px;
  justify-content: center;
`;

const Copy = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: ${({ theme }) => theme.lineHeights.snug};
  margin-bottom: ${({ theme }) => theme.space.xs};
`;

const Body = styled.p`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`;

const Close = styled.button`
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.rounded};
  color: ${({ theme }) => theme.colors.paragraph};
  cursor: pointer;
  display: flex;
  flex: 0 0 32px;
  height: 32px;
  justify-content: center;
`;

const Cta = styled.button`
  color: ${({ theme }) => theme.colors.highlight};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-left: 52px;
  margin-top: ${({ theme }) => theme.space.md};
  padding: 0;
`;

const ForestTeaser: React.FC = () => {
  const router = useRouter();
  const t = useI18n(router.locale);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia?.(
      `(min-width: ${BREAKPOINTS.xTablet})`,
    ).matches;
    if (desktop) {
      trackOnce(
        "feedback_nudge_view",
        { locale: router.locale ?? "en" },
        "forest-desktop-teaser",
      );
    }
  }, [router.locale]);

  if (dismissed) return null;

  const openForest = () => {
    trackEvent("forest_teaser_click", { locale: router.locale ?? "en" });
    document.getElementById("forest")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <Card aria-label={t.forestTeaserTitle}>
      <Header>
        <Icon aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 3C10 4 5 9 5 17c5 0 11-2 14-14Z" />
            <path d="M5 21c2-6 6-10 12-14" />
          </svg>
        </Icon>
        <Copy>
          <Title>{t.forestTeaserTitle}</Title>
          <Body>{t.forestTeaserBody}</Body>
        </Copy>
        <Close
          aria-label={t.forestTeaserDismiss}
          onClick={() => {
            trackEvent("feedback_nudge_dismiss", {
              locale: router.locale ?? "en",
            });
            setDismissed(true);
          }}
        >
          ✕
        </Close>
      </Header>
      <Cta onClick={openForest}>{t.forestTeaserCta} →</Cta>
    </Card>
  );
};

export default ForestTeaser;
