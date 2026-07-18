import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/router";

import styled from "styled-components";

import { BREAKPOINTS } from "@constants";
import { trackEvent } from "@lib/utils/analytics";
import { SECTION_LABELS, useI18n } from "@lib/utils/i18n";
import { resolveViewFromHash, StorySub } from "@lib/utils/mobileNav";

/* Rendered at the top of both Journey and Experience; only one instance is
   ever visible because the sections are mutually exclusive in the story tab */
const Group = styled.div`
  display: none;

  @media (max-width: 899.98px) {
    html[data-mobile-view="story"] & {
      background: rgba(128, 128, 128, 0.12);
      border-radius: 999px;
      display: flex;
      margin: 0 0 ${({ theme }) => theme.space.xl};
      padding: 0.25rem;
    }
  }

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: none !important;
  }
`;

const Segment = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.background : "transparent"};
  border: none;
  border-radius: 999px;
  box-shadow: ${({ $active }) =>
    $active ? "0 1px 4px rgba(0, 0, 0, 0.12)" : "none"};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.headline : theme.colors.paragraph};
  cursor: pointer;
  flex: 1;
  font-family: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  min-height: 44px;
  transition: background 0.2s ease, color 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: -2px;
  }
`;

const SUBS: StorySub[] = ["journey", "experience"];

const StorySegmentedControl: React.FC = () => {
  const { locale } = useRouter();
  const t = useI18n(locale);
  const localeKey = locale === "it" ? "it" : "en";
  const [active, setActive] = useState<StorySub>("journey");

  const syncFromLocation = useCallback(() => {
    setActive(resolveViewFromHash(window.location.hash).storySub);
  }, []);

  useEffect(() => {
    syncFromLocation();
    window.addEventListener("hashchange", syncFromLocation);
    return () => window.removeEventListener("hashchange", syncFromLocation);
  }, [syncFromLocation]);

  const select = (sub: StorySub) => {
    if (sub === active) return;
    setActive(sub);
    document.documentElement.setAttribute("data-story-sub", sub);
    window.history.pushState(
      { ...window.history.state, mobileView: "story", storySub: sub },
      "",
      `${window.location.pathname}${window.location.search}#${sub}`,
    );
    window.scrollTo({ top: 0, behavior: "auto" });
    trackEvent(
      sub === "experience" ? "story_experience_view" : "story_journey_view",
      {}
    );
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = active === "journey" ? "experience" : "journey";
    select(next);
    const el = document.querySelector<HTMLElement>(
      `[data-story-segment="${next}"]`
    );
    el?.focus();
  };

  return (
    <Group role="tablist" aria-label={t.storySubNavigation} onKeyDown={onKeyDown}>
      {SUBS.map((sub) => (
        <Segment
          key={sub}
          role="tab"
          data-story-segment={sub}
          aria-selected={active === sub}
          aria-controls={sub}
          tabIndex={active === sub ? 0 : -1}
          $active={active === sub}
          onClick={() => select(sub)}
        >
          {SECTION_LABELS[sub][localeKey]}
        </Segment>
      ))}
    </Group>
  );
};

export default StorySegmentedControl;
