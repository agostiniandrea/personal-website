import { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";

import styled from "styled-components";

import { MobileFeedbackNudge } from "@components/molecules";
import { BREAKPOINTS, BREAKPOINTS_BELOW } from "@constants";
import { trackEvent } from "@lib/utils/analytics";
import { useI18n } from "@lib/utils/i18n";
import {
  MobileNavigationState,
  MobileTab,
  MobileView,
  MORE_VIEWS,
  MoreDestination,
  OPEN_MOBILE_EXPLORE_EVENT,
  resolveManagedHash,
  StorySub,
  tabForView,
  VIEW_SECTIONS,
} from "@lib/utils/mobileNav";

import { MoreSheet } from "./MoreSheet";
import { NAV_ICONS } from "./navIcons";

export interface MobileNavProps {
  cvDownloadUrl?: string;
}

const Nav = styled.nav`
  backdrop-filter: blur(12px);
  background: color-mix(
    in srgb,
    ${({ theme }) => theme.colors.background} 96%,
    transparent
  );
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
  font-size: 0.75rem;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  gap: 0.25rem;
  height: 4.5rem;
  justify-content: center;
  letter-spacing: 0.02em;
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
  window.matchMedia?.(`(max-width: ${BREAKPOINTS_BELOW.xTablet})`).matches ??
  window.innerWidth < 900;

const cleanMobileUrl = () =>
  `${window.location.pathname}${window.location.search}`;

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
  const [mobileViewport, setMobileViewport] = useState(false);
  const initialized = useRef(false);

  const syncFromHistory = useCallback(() => {
    if (!isMobileViewport()) return;
    const state = window.history.state as MobileNavigationState | null;
    const nextView =
      state?.mobileView && VIEW_SECTIONS[state.mobileView]
        ? state.mobileView
        : "home";
    const nextStorySub =
      state?.storySub === "experience" ? "experience" : "journey";
    setView(nextView);
    setSheetOpen(state?.mobileMoreEntry === true);
    applyView(nextView, nextStorySub);
  }, []);

  useEffect(() => {
    const media = window.matchMedia(
      `(max-width: ${BREAKPOINTS_BELOW.xTablet})`,
    );
    const initialize = () => {
      setMobileViewport(media.matches);
      if (!isHomepagePath(router.pathname) || !media.matches) {
        setSheetOpen(false);
        document.documentElement.removeAttribute("data-mobile-view");
        document.documentElement.removeAttribute("data-story-sub");
        return;
      }
      if (!initialized.current) {
        initialized.current = true;
        const initialState: MobileNavigationState = {
          ...window.history.state,
          mobileMoreEntry: false,
          mobileView: "home",
          storySub: "journey",
        };
        window.history.replaceState(initialState, "", cleanMobileUrl());
        setView("home");
        setSheetOpen(false);
        applyView("home", "journey");
        return;
      }
      syncFromHistory();
    };
    initialize();
    window.addEventListener("popstate", syncFromHistory);
    media.addEventListener("change", initialize);
    return () => {
      window.removeEventListener("popstate", syncFromHistory);
      media.removeEventListener("change", initialize);
    };
  }, [router.pathname, syncFromHistory]);

  useEffect(() => {
    if (!isHomepagePath(router.pathname) || isMobileViewport()) return;
    document.documentElement.removeAttribute("data-mobile-view");
    document.documentElement.removeAttribute("data-story-sub");
  }, [router.pathname]);

  const navigateTo = useCallback(
    (
      next: MobileView,
      storySub: StorySub = "journey",
      replace = false,
      deferScroll = false,
    ) => {
      const isAlreadyCanonical =
        next === view &&
        document.documentElement.getAttribute("data-story-sub") === storySub;
      setView(next);
      setSheetOpen(false);
      applyView(next, storySub);
      if (!isAlreadyCanonical) {
        window.history[replace ? "replaceState" : "pushState"](
          {
            ...window.history.state,
            mobileMoreEntry: false,
            mobileView: next,
            storySub,
          },
          "",
          cleanMobileUrl(),
        );
      }
      const scrollToTop = () =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        });
      if (deferScroll) window.requestAnimationFrame(scrollToTop);
      else scrollToTop();
      const tab = tabForView(next);
      if (tab !== "more") trackEvent(TAB_EVENTS[tab], {});
      if (next === "forest") {
        trackEvent("forest_view", {
          locale: router.locale ?? "en",
          source: "tab",
        });
      }
      if (next === "story") {
        trackEvent(
          storySub === "experience"
            ? "story_experience_view"
            : "story_journey_view",
          {},
        );
      }
    },
    [router.locale, view],
  );

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
      if (
        destination.hash === "#about" ||
        destination.hash === "#forest-impact"
      ) {
        window.requestAnimationFrame(() => {
          document
            .getElementById(destination.hash.slice(1))
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    };
    document.addEventListener("click", onInternalLink, true);
    return () => document.removeEventListener("click", onInternalLink, true);
  }, [navigateTo, router.pathname]);

  const openSheet = useCallback(() => {
    if (!isMobileViewport()) return;
    trackEvent("mobile_more_open", {});
    setSheetOpen(true);
    window.history.pushState(
      {
        ...window.history.state,
        mobileMoreEntry: true,
        mobileView: view,
        storySub:
          document.documentElement.getAttribute("data-story-sub") ===
          "experience"
            ? "experience"
            : "journey",
      },
      "",
      cleanMobileUrl(),
    );
  }, [view]);

  useEffect(() => {
    window.addEventListener(OPEN_MOBILE_EXPLORE_EVENT, openSheet);
    return () =>
      window.removeEventListener(OPEN_MOBILE_EXPLORE_EVENT, openSheet);
  }, [openSheet]);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    if (window.history.state?.mobileMoreEntry) {
      window.history.back();
      return;
    }
  }, []);

  // tapping "More" while the sheet is open dismisses it
  const toggleSheet = useCallback(() => {
    if (sheetOpen) {
      closeSheet();
      return;
    }
    openSheet();
  }, [closeSheet, openSheet, sheetOpen]);

  const onSheetNavigate = (destination: MoreDestination) => {
    trackEvent("mobile_more_destination", { destination });
    const replaceDestination = () =>
      navigateTo(destination, "journey", true, true);

    if (MORE_VIEWS.includes(view as (typeof MORE_VIEWS)[number])) {
      const onReturnToSecondary = () => {
        window.removeEventListener("popstate", onReturnToSecondary);
        replaceDestination();
      };
      window.addEventListener("popstate", onReturnToSecondary);
      setSheetOpen(false);
      window.history.back();
      return;
    }

    replaceDestination();
  };

  const switchMobileLocale = async (nextLocale: "en" | "it") => {
    const storySub =
      document.documentElement.getAttribute("data-story-sub") === "experience"
        ? "experience"
        : "journey";
    setSheetOpen(false);
    await router.push("/", "/", { locale: nextLocale, scroll: false });
    applyView(view, storySub);
    window.history.replaceState(
      {
        ...window.history.state,
        mobileMoreEntry: false,
        mobileView: view,
        storySub,
      },
      "",
      nextLocale === "it" ? "/it" : "/",
    );
  };

  if (!isHomepagePath(router.pathname) || !mobileViewport) return null;

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
      <MobileFeedbackNudge
        blocked={sheetOpen}
        currentView={view}
        onNavigateToForest={() => navigateTo("forest")}
      />
      <Nav aria-label={t.mobileNavigation} data-testid="mobile-nav">
        <TabList>
          {tabs.map(({ id, label }) => (
            <TabItem key={id}>
              <TabButton
                $active={activeTab === id}
                aria-current={activeTab === id ? "page" : undefined}
                aria-expanded={id === "more" ? sheetOpen : undefined}
                aria-haspopup={id === "more" ? "dialog" : undefined}
                onClick={() =>
                  id === "more" ? toggleSheet() : navigateTo(id as MobileTab)
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
        onClose={closeSheet}
        onDownload={closeSheet}
        onLocaleChange={switchMobileLocale}
        onNavigate={onSheetNavigate}
      />
    </>
  );
};

export default MobileNav;
