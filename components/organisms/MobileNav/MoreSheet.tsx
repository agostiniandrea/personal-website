import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useRouter } from "next/router";

import styled, { keyframes } from "styled-components";

import { BREAKPOINTS } from "@constants";
import { trackEvent } from "@lib/utils/analytics";
import { useI18n } from "@lib/utils/i18n";
import { MobileView, MoreDestination } from "@lib/utils/mobileNav";

export interface MoreSheetProps {
  isOpen: boolean;
  activeView: MobileView;
  cvDownloadUrl?: string;
  onClose: () => void;
  onNavigate: (destination: MoreDestination) => void;
}

const ITEM_META: Record<
  MoreDestination,
  { title: { en: string; it: string }; subtitle: { en: string; it: string } }
> = {
  skills: {
    title: { en: "Skills & tools", it: "Competenze e strumenti" },
    subtitle: { en: "Technologies and practices", it: "Tecnologie e pratiche" },
  },
  experience: {
    title: { en: "Experience", it: "Esperienza" },
    subtitle: { en: "Where I've worked", it: "Dove ho lavorato" },
  },
  sustainability: {
    title: { en: "Sustainability", it: "Sostenibilità" },
    subtitle: { en: "Values and action", it: "Valori e azioni" },
  },
  "beyond-code": {
    title: { en: "Beyond code", it: "Oltre il codice" },
    subtitle: {
      en: "Life, travel and passions",
      it: "Vita, viaggi e passioni",
    },
  },
};

const ITEM_ORDER: MoreDestination[] = [
  "skills",
  "experience",
  "sustainability",
  "beyond-code",
];

const enter = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const exit = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(100%); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const SHEET_ANIMATION_MS = 240;

/**
 * Marks the app background inert while the sheet is open, but keeps the bottom
 * tab bar operable — it is the sheet's own trigger, so tapping another tab must
 * still switch section (closing the sheet) and tapping More must close it.
 * Walks up from the nav to #__next, inerting each level's other children.
 * Returns a restore function.
 */
const inertBackground = (): (() => void) => {
  const nav = document.querySelector('[data-testid="mobile-nav"]');
  const root = document.getElementById("__next");
  const affected: Element[] = [];
  const mark = (el: Element) => {
    el.setAttribute("inert", "");
    el.setAttribute("aria-hidden", "true");
    affected.push(el);
  };

  if (nav && root) {
    let node: Element | null = nav;
    while (node && node !== root && node.parentElement) {
      for (const sibling of Array.from(node.parentElement.children)) {
        if (sibling !== node && !sibling.contains(nav)) mark(sibling);
      }
      node = node.parentElement;
    }
  } else if (root) {
    mark(root);
  }

  return () =>
    affected.forEach((el) => {
      el.removeAttribute("inert");
      el.removeAttribute("aria-hidden");
    });
};

/* Stops above the bottom tab bar so the tabs stay visible and tappable while
   the sheet is open. */
const Backdrop = styled.div<{ $closing: boolean }>`
  animation: ${({ $closing }) => ($closing ? fadeOut : fadeIn)}
    ${SHEET_ANIMATION_MS}ms ease-out forwards;
  backdrop-filter: blur(2px);
  background: rgba(10, 10, 15, 0.52);
  bottom: calc(4.5rem + env(safe-area-inset-bottom));
  inset-inline: 0;
  position: fixed;
  top: 0;
  z-index: 201;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: none;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: ${({ $closing }) => ($closing ? 0 : 1)};
  }
`;

const Sheet = styled.div<{ $closing: boolean }>`
  animation: ${({ $closing }) => ($closing ? exit : enter)}
    ${SHEET_ANIMATION_MS}ms ease-out forwards;
  -webkit-overflow-scrolling: touch;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid
    color-mix(
      in srgb,
      ${({ theme }) => theme.colors.highlight} 16%,
      transparent
    );
  border-bottom: 0;
  border-radius: 1.25rem 1.25rem 0 0;
  bottom: calc(4.5rem + env(safe-area-inset-bottom));
  box-sizing: border-box;
  box-shadow: 0 -16px 48px rgba(0, 0, 0, 0.18);
  left: 0;
  max-height: calc(100svh - 4.5rem - env(safe-area-inset-bottom) - 1rem);
  overscroll-behavior: contain;
  overflow-y: auto;
  padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.xl}
    ${({ theme }) => theme.space.xl};
  position: fixed;
  right: 0;
  z-index: 301;

  @media (max-width: 360px) {
    padding-left: ${({ theme }) => theme.space.md};
    padding-right: ${({ theme }) => theme.space.md};
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: ${({ $closing }) =>
      $closing ? "translateY(100%)" : "translateY(0)"};
  }
`;

const Grabber = styled.div`
  background: rgba(128, 128, 128, 0.35);
  border-radius: 999px;
  height: 4px;
  margin: 0 auto ${({ theme }) => theme.space.lg};
  width: 36px;
`;

const SheetHeader = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.space.md};
  position: sticky;
  top: 0;
  z-index: 1;
`;

const SheetTitle = styled.h2`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0;
`;

const CloseButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid rgba(128, 128, 128, 0.16);
  border-radius: ${({ theme }) => theme.radii.rounded};
  color: ${({ theme }) => theme.colors.paragraph};
  cursor: pointer;
  display: flex;
  font-size: ${({ theme }) => theme.fontSizes.md};
  justify-content: center;
  min-height: 44px;
  min-width: 44px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

const ItemList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
  list-style: none;
  margin: 0 0 ${({ theme }) => theme.space.lg};
  padding: 0;
`;

const ItemButton = styled.button<{ $active?: boolean }>`
  align-items: center;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.badgeBg : "transparent"};
  border: 1px solid
    ${({ $active, theme }) => ($active ? theme.colors.stroke : "transparent")};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.highlight : theme.colors.headline};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  gap: ${({ theme }) => theme.space.md};
  min-height: 56px;
  padding: ${({ theme }) => theme.space.sm};
  text-align: left;
  width: 100%;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: -2px;
  }
`;

const ItemIconWrap = styled.span`
  align-items: center;
  background: ${({ theme }) => theme.colors.badgeBg};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.highlight};
  display: flex;
  flex: 0 0 40px;
  height: 40px;
  justify-content: center;
`;

const ItemCopy = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.125rem;
`;

const ItemTitle = styled.span`
  color: ${({ theme }) => theme.colors.headline};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
`;

const ItemSubtitle = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

const Chevron = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.lg};
`;

const ItemIcon = ({ destination }: { destination: MoreDestination }) => (
  <ItemIconWrap aria-hidden="true">
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {destination === "skills" && (
        <>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
          <circle cx="12" cy="12" r="4" />
        </>
      )}
      {destination === "experience" && (
        <>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5h8v2M3 12h18" />
        </>
      )}
      {destination === "sustainability" && (
        <>
          <path d="M19 3C10 4 5 9 5 17c5 0 11-2 14-14Z" />
          <path d="M5 21c2-6 6-10 12-14" />
        </>
      )}
      {destination === "beyond-code" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </>
      )}
    </svg>
  </ItemIconWrap>
);

const CvLink = styled.a`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.highlight};
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ theme }) => theme.colors.highlight};
  display: flex;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.space.lg};
  min-height: 44px;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

const LocaleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.space.md};
`;

const LocaleLabel = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const LocaleButton = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.highlight : "transparent"};
  border: 1px solid ${({ theme }) => theme.colors.highlight};
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.button_text : theme.colors.highlight};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  min-height: 44px;
  min-width: 44px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

export const MoreSheet: React.FC<MoreSheetProps> = ({
  isOpen,
  activeView,
  cvDownloadUrl,
  onClose,
  onNavigate,
}) => {
  const router = useRouter();
  const t = useI18n(router.locale);
  const localeKey = router.locale === "it" ? "it" : "en";
  const sheetRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  /* Stays true while the exit animation plays, so the sheet can slide down
     before unmounting; onAnimationEnd flips it off. */
  const [mounted, setMounted] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return;
    }
    // reduced motion renders no exit animation, so unmount straight away
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMounted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    /* Guarded on mounted too: on open the sheet only exists from the second
       render (mounted flips in an effect), so focusing must wait for it. */
    if (!isOpen || !mounted) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const sheet = sheetRef.current;
    sheet?.querySelector<HTMLElement>("button, a")?.focus();
    document.body.style.overflow = "hidden";
    const restoreInert = inertBackground();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !sheet) return;
      const focusables = Array.from(
        sheet.querySelectorAll<HTMLElement>("button, a[href]"),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      restoreInert();
      restoreFocusRef.current?.focus();
    };
  }, [isOpen, mounted, onClose]);

  if (!mounted) return null;

  const closing = !isOpen;

  const switchLocale = (next: "en" | "it") => {
    if (next === localeKey) return;
    router.push(router.asPath, router.asPath, { locale: next, scroll: false });
  };

  return createPortal(
    <>
      <Backdrop
        $closing={closing}
        onClick={onClose}
        data-testid="more-backdrop"
      />
      <Sheet
        $closing={closing}
        onAnimationEnd={() => {
          if (closing) setMounted(false);
        }}
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.moreTitle}
        data-testid="more-sheet"
      >
        <Grabber aria-hidden="true" />
        <SheetHeader>
          <SheetTitle>{t.moreTitle}</SheetTitle>
          <CloseButton onClick={onClose} aria-label={t.closeMenu}>
            ✕
          </CloseButton>
        </SheetHeader>
        <ItemList>
          {ITEM_ORDER.map((destination) => (
            <li key={destination}>
              <ItemButton
                $active={activeView === destination}
                aria-current={activeView === destination ? "page" : undefined}
                onClick={() => onNavigate(destination)}
              >
                <ItemIcon destination={destination} />
                <ItemCopy>
                  <ItemTitle>
                    {ITEM_META[destination].title[localeKey]}
                  </ItemTitle>
                  <ItemSubtitle>
                    {ITEM_META[destination].subtitle[localeKey]}
                  </ItemSubtitle>
                </ItemCopy>
                <Chevron aria-hidden="true">›</Chevron>
              </ItemButton>
            </li>
          ))}
        </ItemList>
        {cvDownloadUrl && (
          <CvLink
            href={cvDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("cv_downloaded", { locale: router.locale ?? "en" })
            }
          >
            ↓ {t.moreDownloadCv}
          </CvLink>
        )}
        <LocaleRow>
          <LocaleLabel>{t.moreLanguage}</LocaleLabel>
          <LocaleButton
            $active={localeKey === "en"}
            onClick={() => switchLocale("en")}
            aria-pressed={localeKey === "en"}
          >
            EN
          </LocaleButton>
          <LocaleButton
            $active={localeKey === "it"}
            onClick={() => switchLocale("it")}
            aria-pressed={localeKey === "it"}
          >
            IT
          </LocaleButton>
        </LocaleRow>
      </Sheet>
    </>,
    document.body,
  );
};
