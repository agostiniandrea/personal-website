import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";

import styled from "styled-components";

import { BREAKPOINTS } from "@constants";
import { trackEvent, trackOnce } from "@lib/utils/analytics";
import { useI18n } from "@lib/utils/i18n";
import { MobileView } from "@lib/utils/mobileNav";

const DISMISSED_KEY = "forest-feedback-nudge-dismissed";
const SUBMITTED_KEY = "forest-feedback-submitted";
const STARTED_AT_KEY = "forest-feedback-nudge-started-at";
const VISITED_KEY = "forest-feedback-nudge-visited";
const DELAY_MS = 35_000;
const MEANINGFUL_SCROLL_PX = 240;

const Card = styled.aside`
  background: color-mix(
    in srgb,
    ${({ theme }) => theme.colors.background} 96%,
    ${({ theme }) => theme.colors.highlight}
  );
  border: 1px solid
    color-mix(in srgb, ${({ theme }) => theme.colors.highlight} 38%, transparent);
  border-radius: ${({ theme }) => theme.radii.md};
  bottom: calc(4.5rem + env(safe-area-inset-bottom) + 1rem);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.2);
  color: ${({ theme }) => theme.colors.headline};
  left: 1rem;
  padding: ${({ theme }) => theme.space.md};
  position: fixed;
  right: 1rem;
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 190;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Header = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.space.sm};
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
  line-height: ${({ theme }) => theme.lineHeights.normal};
`;

const Close = styled.button`
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.rounded};
  color: ${({ theme }) => theme.colors.paragraph};
  cursor: pointer;
  display: flex;
  flex: 0 0 44px;
  height: 44px;
  justify-content: center;
  margin: -0.625rem -0.625rem 0 0;
`;

const Cta = styled.button`
  color: ${({ theme }) => theme.colors.highlight};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  margin-top: ${({ theme }) => theme.space.sm};
  padding: 0;
`;

export interface MobileFeedbackNudgeProps {
  currentView: MobileView;
  blocked: boolean;
  onNavigateToForest: () => void;
}

const readVisited = (): Set<string> => {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(VISITED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
};

const MobileFeedbackNudge: React.FC<MobileFeedbackNudgeProps> = ({
  blocked,
  currentView,
  onNavigateToForest,
}) => {
  const { locale } = useRouter();
  const t = useI18n(locale);
  const [delayElapsed, setDelayElapsed] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [meaningfulScroll, setMeaningfulScroll] = useState(false);
  const [mobileViewport, setMobileViewport] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [visitedCount, setVisitedCount] = useState(0);
  const viewedWorkOrStory = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 899.98px)");
    const update = () => setMobileViewport(media.matches || window.innerWidth < 900);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const alreadyDismissed = sessionStorage.getItem(DISMISSED_KEY) === "true";
    const alreadySubmitted = localStorage.getItem(SUBMITTED_KEY) === "true";
    setDismissed(alreadyDismissed || alreadySubmitted);

    const storedStart = Number(sessionStorage.getItem(STARTED_AT_KEY));
    const startedAt = Number.isFinite(storedStart) && storedStart > 0
      ? storedStart
      : Date.now();
    sessionStorage.setItem(STARTED_AT_KEY, String(startedAt));
    const remaining = Math.max(0, DELAY_MS - (Date.now() - startedAt));
    const timeout = window.setTimeout(() => setDelayElapsed(true), remaining);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const visited = readVisited();
    if (["home", "work", "story", "forest"].includes(currentView)) {
      visited.add(currentView);
      sessionStorage.setItem(VISITED_KEY, JSON.stringify([...visited]));
    }
    setVisitedCount(visited.size);
    if (currentView === "work" || currentView === "story") {
      viewedWorkOrStory.current = true;
    }
  }, [currentView]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY >= MEANINGFUL_SCROLL_PX) setMeaningfulScroll(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const updateModalState = () =>
      setModalOpen(Boolean(document.querySelector('[aria-modal="true"]')));
    updateModalState();
    const observer = new MutationObserver(updateModalState);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onSubmitted = () => setDismissed(true);
    window.addEventListener("feedback-submitted", onSubmitted);
    return () => window.removeEventListener("feedback-submitted", onSubmitted);
  }, []);

  const meaningfulInteraction =
    visitedCount >= 2 || (viewedWorkOrStory.current && meaningfulScroll);
  const visible =
    delayElapsed &&
    meaningfulInteraction &&
    currentView !== "forest" &&
    mobileViewport &&
    !blocked &&
    !modalOpen &&
    !dismissed;

  useEffect(() => {
    if (visible) {
      trackOnce(
        "forest_feedback_nudge_view",
        { locale: locale ?? "en" },
        "mobile-forest-feedback-nudge-view",
      );
    }
  }, [locale, visible]);

  useEffect(() => {
    if (!visible) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      sessionStorage.setItem(DISMISSED_KEY, "true");
      trackEvent("forest_feedback_nudge_dismiss", {
        locale: locale ?? "en",
      });
      setDismissed(true);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [locale, visible]);

  if (!visible) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "true");
    trackEvent("forest_feedback_nudge_dismiss", { locale: locale ?? "en" });
    setDismissed(true);
  };

  const navigate = () => {
    sessionStorage.setItem(DISMISSED_KEY, "true");
    trackEvent("forest_feedback_nudge_click", { locale: locale ?? "en" });
    setDismissed(true);
    onNavigateToForest();
  };

  return (
    <Card aria-labelledby="mobile-feedback-nudge-title" data-testid="mobile-feedback-nudge">
      <Header>
        <Copy>
          <Title id="mobile-feedback-nudge-title">{t.mobileFeedbackNudgeTitle}</Title>
          <Body>{t.mobileFeedbackNudgeBody}</Body>
          <Cta onClick={navigate}>{t.mobileFeedbackNudgeCta} →</Cta>
        </Copy>
        <Close aria-label={t.mobileFeedbackNudgeDismiss} onClick={dismiss}>
          ✕
        </Close>
      </Header>
    </Card>
  );
};

export default MobileFeedbackNudge;
