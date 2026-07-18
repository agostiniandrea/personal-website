import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { useRouter } from "next/router";

import styled from "styled-components";

import { BREAKPOINTS } from "@constants";
import { trackEvent } from "@lib/utils/analytics";
import { useI18n } from "@lib/utils/i18n";
import { MobileView, MoreView } from "@lib/utils/mobileNav";

export interface MoreSheetProps {
  isOpen: boolean;
  activeView: MobileView;
  cvDownloadUrl?: string;
  onClose: () => void;
  onNavigate: (destination: MoreView) => void;
}

const ITEM_LABELS: Record<MoreView, { en: string; it: string }> = {
  skills: { en: "Skills & tools", it: "Competenze e strumenti" },
  sustainability: { en: "Sustainability", it: "Sostenibilità" },
  "beyond-code": { en: "Beyond code", it: "Oltre il codice" },
};

const Backdrop = styled.div`
  background: rgba(0, 0, 0, 0.45);
  inset: 0;
  position: fixed;
  z-index: 300;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: none;
  }
`;

const Sheet = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 1rem 1rem 0 0;
  bottom: 0;
  left: 0;
  max-height: 80vh;
  overflow-y: auto;
  padding: ${({ theme }) => theme.space.lg} ${({ theme }) => theme.space.xl}
    calc(${({ theme }) => theme.space.xl} + env(safe-area-inset-bottom));
  position: fixed;
  right: 0;
  z-index: 301;
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
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.space.lg};
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
  background: none;
  border: none;
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
  list-style: none;
  margin: 0 0 ${({ theme }) => theme.space.lg};
  padding: 0;
`;

const ItemButton = styled.button<{ $active?: boolean }>`
  align-items: center;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(128, 128, 128, 0.12);
  color: ${({ $active, theme }) =>
    $active ? theme.colors.highlight : theme.colors.headline};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  min-height: 44px;
  padding: ${({ theme }) => theme.space.md} 0;
  text-align: left;
  width: 100%;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: -2px;
  }
`;

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

  useEffect(() => {
    if (!isOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const sheet = sheetRef.current;
    sheet?.querySelector<HTMLElement>("button, a")?.focus();
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !sheet) return;
      const focusables = Array.from(
        sheet.querySelectorAll<HTMLElement>("button, a[href]")
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
      restoreFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const switchLocale = (next: "en" | "it") => {
    if (next === localeKey) return;
    router.push(router.asPath, router.asPath, { locale: next, scroll: false });
  };

  return createPortal(
    <>
      <Backdrop onClick={onClose} data-testid="more-backdrop" />
      <Sheet
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
          {(Object.keys(ITEM_LABELS) as MoreView[]).map((destination) => (
            <li key={destination}>
              <ItemButton
                $active={activeView === destination}
                aria-current={activeView === destination ? "page" : undefined}
                onClick={() => onNavigate(destination)}
              >
                {ITEM_LABELS[destination][localeKey]}
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
    document.body
  );
};
