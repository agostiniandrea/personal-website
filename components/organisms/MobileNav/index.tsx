import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/router";

import styled from "styled-components";

import { BREAKPOINTS } from "@constants";
import { trackEvent } from "@lib/utils/analytics";
import { useI18n } from "@lib/utils/i18n";
import {
  MobileTab,
  MobileView,
  MoreDestination,
  resolveManagedHash,
  resolveViewFromState,
  StorySub,
  tabForView,
} from "@lib/utils/mobileNav";

import { MoreSheet } from "./MoreSheet";
import { NAV_ICONS } from "./navIcons";

export interface MobileNavProps {
  cvDownloadUrl?: string;
}

const Nav = styled.nav`
  background: ${({ theme }) => theme.colors.background};
  border-top: 1px solid rgba(128, 128, 128, 0.18);
  bottom: 0;
  display: block;
  left: 0;
  padding-bottom: env(safe-area-inset-bottom);
  position: fixed;
  right: 0;
  z-index: 200;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: none;
  }
`;

const TabList = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const TabItem = styled.li`
  flex: 1;
`;

const TabButton = styled.button<{ $active: boolean }>`
  align-items: center;
  background: none;
  border: none;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.highlight : theme.colors.paragraph};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font-family: inherit;
  font-size: 0.6875rem;
  font-weight: ${({ $active, theme }) =>
    $active ? theme.fontWeights.semiBold : theme.fontWeights.medium};
  gap: 0.25rem;
  justify-content: center;
  letter-spacing: 0.02em;
  min-height: 44px;
  padding: ${({ theme }) => theme.space.sm} 0 ${({ theme }) => theme.space.xs};
  transition: color 0.2s ease;
  width: 100%;

  svg {
    display: block;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: -2px;
  }
`;

const isHomepagePath = (pathname: string) => pathname === "/";
const isMobileViewport = () =>
  window.matchMedia?.(`(max-width: ${BREAKPOINTS.xTablet})`).matches ??
  window.innerWidth < 900;

/* Owns the html[data-mobile-view] / [data-story-sub] attributes after
   hydration; the inline _document script sets them before first paint. */
export function applyView(view: MobileView, storySub: StorySub) {
  const el = document.documentElement;
  el.setAttribute("data-mobile-view", view);
  el.setAttribute("data-story-sub", storySub);
}

const TAB_EVENTS = {
  home: "mobile_tab_home",
  work: "mobile_tab_work",
  story: "mobile_tab_story",
  forest: "mobile_tab_forest",
} as const;

const MobileNav: React.FC<MobileNavProps> = ({ cvDownloadUrl }) => {
  const router = useRouter();
  const t = useI18n(router.locale);
  const [view, setView] = useState<MobileView>("home");
  const [sheetOpen, setSheetOpen] = useState(false);

  const syncFromLocation = useCallback(() => {
    const resolved = resolveViewFromState(
      window.history.state as { mobileView?: MobileView; storySub?: StorySub },
      window.location.hash,
    );
    setView(resolved.view);
    applyView(resolved.view, resolved.storySub);

    if (isMobileViewport() && window.location.hash) {
      window.history.replaceState(
        { ...window.history.state, ...resolved, mobileView: resolved.view },
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    }
  }, []);

  useEffect(() => {
    if (!isHomepagePath(router.pathname)) {
      document.documentElement.removeAttribute("data-mobile-view");
      document.documentElement.removeAttribute("data-story-sub");
      return;
    }
    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener("hashchange", syncFromLocation);
    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener("hashchange", syncFromLocation);
    };
  }, [router.pathname, syncFromLocation]);

  const navigateTo = useCallback((next: MobileView, storySub: StorySub = "journey") => {
    if (
      next === view &&
      document.documentElement.getAttribute("data-story-sub") === storySub
    )
      return;
    setView(next);
    applyView(next, storySub);
    window.history.pushState(
      { ...window.history.state, mobileView: next, storySub },
      "",
      `${window.location.pathname}${window.location.search}`,
    );
    window.scrollTo({ top: 0, behavior: "auto" });
    const tab = tabForView(next);
    if (tab !== "more") trackEvent(TAB_EVENTS[tab], {});
    if (next === "forest") {
      trackEvent("forest_view", { locale: router.locale ?? "en", source: "tab" });
    }
    if (next === "story") {
      trackEvent(
        storySub === "experience"
          ? "story_experience_view"
          : "story_journey_view",
        {}
      );
    }
  }, [router.locale, view]);

  useEffect(() => {
    if (!isHomepagePath(router.pathname)) return;
    const onInternalLink = (event: MouseEvent) => {
      if (!isMobileViewport()) return;
      const target = event.target as Element | null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        destination.pathname.replace(/\/$/, "") !==
          window.location.pathname.replace(/\/$/, "")
      )
        return;
      const resolved = resolveManagedHash(destination.hash);
      if (!resolved) return;
      event.preventDefault();
      event.stopPropagation();
      navigateTo(resolved.view, resolved.storySub);
    };
    document.addEventListener("click", onInternalLink, true);
    return () => document.removeEventListener("click", onInternalLink, true);
  }, [navigateTo, router.pathname]);

  const openSheet = () => {
    trackEvent("mobile_more_open", {});
    setSheetOpen(true);
  };

  const onSheetNavigate = (destination: MoreDestination) => {
    trackEvent("mobile_more_destination", { destination });
    setSheetOpen(false);
    if (destination === "experience") {
      navigateTo("story", "experience");
    } else {
      navigateTo(destination);
    }
  };

  if (!isHomepagePath(router.pathname)) return null;

  const activeTab = sheetOpen ? "more" : tabForView(view);

  const tabs: { id: MobileTab | "more"; label: string }[] = [
    { id: "home", label: t.tabHome },
    { id: "work", label: t.tabWork },
    { id: "story", label: t.tabStory },
    { id: "forest", label: t.tabForest },
    { id: "more", label: t.tabMore },
  ];

  return (
    <>
      <Nav aria-label={t.mobileNavigation} data-testid="mobile-nav">
        <TabList>
          {tabs.map(({ id, label }) => (
            <TabItem key={id}>
              <TabButton
                $active={activeTab === id}
                aria-current={activeTab === id ? "page" : undefined}
                aria-haspopup={id === "more" ? "dialog" : undefined}
                onClick={() =>
                  id === "more" ? openSheet() : navigateTo(id as MobileTab)
                }
              >
                {NAV_ICONS[id]}
                {label}
              </TabButton>
            </TabItem>
          ))}
        </TabList>
      </Nav>
      <MoreSheet
        isOpen={sheetOpen}
        activeView={view}
        cvDownloadUrl={cvDownloadUrl}
        onClose={() => setSheetOpen(false)}
        onNavigate={onSheetNavigate}
      />
    </>
  );
};

export default MobileNav;
