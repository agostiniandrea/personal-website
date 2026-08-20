/* One icon in the header, beside the locale switch, opening a small popover
   with the three choices. Chosen over an inline three-segment control: the
   segmented version needed 122px of header at every width and competed with
   the navigation, while the setting itself is touched once and then never
   again. The trigger shows the choice currently in force. */

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";

import { Monitor, Moon, Sun } from "lucide-react";
import styled from "styled-components";

import { BREAKPOINTS_BELOW } from "@constants";
import { trackEvent } from "@lib/utils/analytics";
import { useI18n } from "@lib/utils/i18n";
import {
  applyThemeChoice,
  readThemeChoice,
  THEME_CHOICES,
  ThemeChoice,
} from "@lib/utils/theme";

const ICONS: Record<ThemeChoice, typeof Sun> = {
  dark: Moon,
  light: Sun,
  system: Monitor,
};

const Wrapper = styled.div`
  position: relative;
`;

/* Mirrors SiteHeader's LocaleButton box exactly — same size, radius, border
   and breakpoint shrink. The two sit side by side as a pair of site
   preferences, so a difference of a few pixels reads as a mistake rather than
   as a distinction. If one of them changes, change both. */
const Trigger = styled.button`
  align-items: center;
  background: none;
  border: 1px solid
    color-mix(in srgb, ${({ theme }) => theme.colors.headline} 20%, transparent);
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ theme }) => theme.colors.headline};
  cursor: pointer;
  display: flex;
  justify-content: center;
  min-height: 44px;
  min-width: 44px;
  padding: 0.25rem 0.625rem;
  transition: all 0.2s ease;

  svg {
    height: 18px;
    width: 18px;
  }

  @media (hover: hover) {
    &:hover {
      background: color-mix(
        in srgb,
        ${({ theme }) => theme.colors.headline} 5%,
        transparent
      );
      border-color: color-mix(
        in srgb,
        ${({ theme }) => theme.colors.headline} 40%,
        transparent
      );
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
  }

  @media (max-width: ${BREAKPOINTS_BELOW.xTablet}) {
    border-color: color-mix(
      in srgb,
      ${({ theme }) => theme.colors.headline} 22%,
      transparent
    );
    border-radius: 6px;
    height: 36px;
    min-height: 36px;
    min-width: 36px;
    padding: 0;
    width: 36px;

    svg {
      height: 16px;
      width: 16px;
    }

    @media (hover: hover) {
      &:hover {
        background: transparent;
        border-color: ${({ theme }) => theme.colors.highlight};
        color: ${({ theme }) => theme.colors.highlight};
      }
    }

    &:focus-visible {
      border-color: ${({ theme }) => theme.colors.highlight};
      color: ${({ theme }) => theme.colors.highlight};
    }
  }
`;

/* All three glyphs are rendered and the cascade picks one, for the same reason
   the palette itself is driven by the attribute: React cannot know the stored
   choice until it hydrates, so an icon chosen from state would show the system
   monitor for a frame to everyone who picked light or dark. Mirrored
   condition — no attribute *is* system. */
const TriggerIcon = styled.span`
  align-items: center;
  display: none;
  justify-content: center;

  html[data-theme="light"] &[data-icon="light"],
  html[data-theme="dark"] &[data-icon="dark"],
  html:not([data-theme]) &[data-icon="system"] {
    display: flex;
  }
`;

const Popover = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(128, 128, 128, 0.24);
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  /* Wide enough for the longest label in either locale ("Sistema") plus its
     icon and padding, and no wider: the menu holds three short words. */
  min-width: 8rem;
  padding: ${({ theme }) => theme.space.xs};
  position: absolute;
  right: 0;
  top: calc(100% + ${({ theme }) => theme.space.sm});
  z-index: 400;
`;

const Option = styled.button<{ $active: boolean }>`
  align-items: center;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.surface : "transparent"};
  border: none;
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.headline : theme.colors.paragraph};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semiBold};
  gap: ${({ theme }) => theme.space.md};
  min-height: 40px;
  padding: 0 ${({ theme }) => theme.space.md};
  text-align: left;

  @media (hover: hover) {
    &:hover {
      background: ${({ theme }) => theme.colors.surface};
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: -2px;
  }
`;

const ThemeMenu: React.FC = () => {
  const { locale } = useRouter();
  const t = useI18n(locale);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => {
    setChoice(readThemeChoice());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const labels: Record<ThemeChoice, string> = {
    dark: t.themeDark,
    light: t.themeLight,
    system: t.themeSystem,
  };

  const select = (next: ThemeChoice) => {
    setChoice(next);
    applyThemeChoice(next);
    trackEvent("theme_changed", { locale: locale ?? "en", theme: next });
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <Wrapper ref={wrapperRef}>
      <Trigger
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${t.themeToggleLabel}: ${labels[choice]}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        {THEME_CHOICES.map((option) => {
          const Glyph = ICONS[option];
          return (
            <TriggerIcon key={option} data-icon={option} aria-hidden="true">
              <Glyph size={18} strokeWidth={2} />
            </TriggerIcon>
          );
        })}
      </Trigger>
      {open && (
        <Popover role="menu" aria-label={t.themeToggleLabel}>
          {THEME_CHOICES.map((option) => {
            const Glyph = ICONS[option];
            const active = option === choice;
            return (
              <Option
                key={option}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                $active={active}
                onClick={() => select(option)}
              >
                <Glyph size={16} strokeWidth={2} aria-hidden="true" />
                {labels[option]}
              </Option>
            );
          })}
        </Popover>
      )}
    </Wrapper>
  );
};

export default ThemeMenu;
