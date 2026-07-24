import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import styled from "styled-components";

import { BREAKPOINTS_BELOW } from "@constants";
import { trackEvent, trackOnce } from "@lib/utils/analytics";
import { useI18n } from "@lib/utils/i18n";

const Card = styled.aside<{ $visible: boolean }>`
  background: color-mix(
    in srgb,
    ${({ theme }) => theme.colors.background} 94%,
    ${({ theme }) => theme.colors.highlight}
  );
  border: 1px solid
    color-mix(
      in srgb,
      ${({ theme }) => theme.colors.highlight} 32%,
      transparent
    );
  border-radius: ${({ theme }) => theme.radii.lg};
  bottom: ${({ theme }) => theme.space.xl};
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.16);
  display: block;
  max-width: 340px;
  padding: ${({ theme }) => theme.space.lg};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
  position: fixed;
  right: ${({ theme }) => theme.space.xl};
  transform: ${({ $visible }) =>
    $visible ? "translateY(0)" : "translateY(12px)"};
  transition:
    opacity 0.3s ease,
    transform 0.3s ease,
    visibility 0.3s;
  visibility: ${({ $visible }) => ($visible ? "visible" : "hidden")};
  z-index: 90;

  @media (max-width: ${BREAKPOINTS_BELOW.xTablet}) {
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

const notifyVisibility = (visible: boolean) => {
  document.body.dataset.feedbackNudgeVisible = visible ? "true" : "false";
  window.dispatchEvent(
    new CustomEvent("feedback-nudge-visibility", { detail: { visible } }),
  );
};

const DISMISSED_KEY = "forest-desktop-nudge-dismissed";

const FeedbackNudge: React.FC = () => {
  const router = useRouter();
  const t = useI18n(router.locale);
  const [dismissed, setDismissed] = useState(false);
  const [inlineTeaserVisible, setInlineTeaserVisible] = useState(false);
  const [projectActionsVisible, setProjectActionsVisible] = useState(false);
  const [teaserEngaged, setTeaserEngaged] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  /* One-shot: the prompt earns its slot only after real engagement (scrolling
     past most of the first viewport) instead of popping up on load. */
  const [pastHero, setPastHero] = useState(false);
  const visible =
    pastHero &&
    !dismissed &&
    !inlineTeaserVisible &&
    !modalOpen &&
    !projectActionsVisible &&
    !teaserEngaged;

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISSED_KEY) === "true");
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY <= window.innerHeight * 0.6) return;
      setPastHero(true);
      window.removeEventListener("scroll", onScroll);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const projects = document.getElementById("projects");
    if (!projects) return;
    const observer = new IntersectionObserver(
      ([entry]) => setProjectActionsVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(projects);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const forest = document.getElementById("forest");
    if (!forest) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      sessionStorage.setItem(DISMISSED_KEY, "true");
      setDismissed(true);
    });
    observer.observe(forest);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setTeaserEngaged(
      sessionStorage.getItem("forest-inline-teaser-engaged") === "true",
    );
    const teaser = document.querySelector('[data-testid="forest-teaser"]');
    if (!teaser) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInlineTeaserVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(teaser);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onEngaged = () => setTeaserEngaged(true);
    window.addEventListener("forest-inline-teaser-engaged", onEngaged);
    return () =>
      window.removeEventListener("forest-inline-teaser-engaged", onEngaged);
  }, []);

  useEffect(() => {
    const updateModalState = () => {
      const nextModalOpen = Boolean(
        document.querySelector('[aria-modal="true"]'),
      );
      setModalOpen((current) =>
        current === nextModalOpen ? current : nextModalOpen,
      );
    };
    updateModalState();
    const observer = new MutationObserver(updateModalState);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    notifyVisibility(visible);
    if (visible) {
      trackOnce(
        "feedback_nudge_view",
        { locale: router.locale ?? "en" },
        "desktop-feedback-nudge",
      );
    }
    return () => notifyVisibility(false);
  }, [router.locale, visible]);

  /* Definitive states unmount; contextual hides (teaser/projects in view,
     pre-scroll, open modal) fade the card instead of yanking it. */
  if (dismissed || teaserEngaged) return null;

  const openForest = () => {
    sessionStorage.setItem(DISMISSED_KEY, "true");
    setDismissed(true);
    trackEvent("feedback_nudge_click", { locale: router.locale ?? "en" });
    document.getElementById("forest-impact")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <Card
      $visible={visible}
      aria-label={t.feedbackNudgeTitle}
      data-testid="feedback-nudge"
    >
      <Header>
        <Icon aria-hidden="true">🌱</Icon>
        <Copy>
          <Title>{t.feedbackNudgeTitle}</Title>
          <Body>{t.feedbackNudgeBody}</Body>
        </Copy>
        <Close
          aria-label={t.feedbackNudgeDismiss}
          onClick={() => {
            sessionStorage.setItem(DISMISSED_KEY, "true");
            trackEvent("feedback_nudge_dismiss", {
              locale: router.locale ?? "en",
            });
            setDismissed(true);
          }}
        >
          ✕
        </Close>
      </Header>
      <Cta onClick={openForest}>{t.feedbackNudgeCta} →</Cta>
    </Card>
  );
};

export default FeedbackNudge;
