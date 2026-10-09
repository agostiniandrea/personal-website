import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { ArrowUpRight, BadgeCheck } from "lucide-react";
import styled from "styled-components";

import TreeNationLabel, { useColorScheme } from "../TreeNationLabel";

/* A small certification badge that opens a compact popover holding the official
   Tree-Nation Tree Counter label and a link to the public forest.

   - Closed by default. The label is only mounted while the popover is open, so
     the third-party script is not asked to render anything nobody can see.
   - Pointer-fine devices: hover opens it, click pins it open (click again, Esc
     or an outside click closes it). Touch: tap toggles it.
   - Keyboard: focusing the button opens it, Enter/Space pins it, Tab walks into
     the popover (it follows the button in the DOM), Esc closes it and gives
     focus back, and tabbing out of it closes it. Not a modal: focus is never
     trapped.
   - Placement: above the badge, flipped below when clipped by the top of the
     viewport, nudged sideways to keep a 16px margin.
   The panel follows the site theme: white with the light Tree-Nation label, or a
   dark surface with the dark label. */

export interface TreeNationPopoverProps {
  /** Accessible name of the badge button (localized by the host). */
  ariaLabel: string;
  /** One short line under the label, e.g. that the two counts may differ. */
  note: string;
  /** Public Tree-Nation forest. */
  linkHref: string;
  linkLabel: string;
  className?: string;
}

/* Light: a white card. Dark: a raised dark surface (the page itself is almost
   black, so the card needs its own edge) with the site's own dark-theme teal. */
const PALETTE = {
  dark: {
    border: "rgba(255, 255, 255, 0.14)",
    divider: "rgba(255, 255, 255, 0.1)",
    linkColor: "#2dd4bf",
    linkHover: "#5eead4",
    linkUnderline: "rgba(45, 212, 191, 0.4)",
    muted: "#a0a0b0",
    shadow: "0 8px 28px rgba(0, 0, 0, 0.55)",
    surface: "#15151d",
    text: "#ffffff",
  },
  light: {
    border: "rgba(0, 0, 0, 0.12)",
    divider: "rgba(0, 0, 0, 0.08)",
    linkColor: "#0f766e",
    linkHover: "#0b5f58",
    linkUnderline: "rgba(15, 118, 110, 0.35)",
    muted: "#5b6470",
    shadow: "0 8px 28px rgba(0, 0, 0, 0.18)",
    surface: "#ffffff",
    text: "#1a1a1a",
  },
} as const;

const palette = (dark: boolean) => (dark ? PALETTE.dark : PALETTE.light);

interface Themed {
  $dark: boolean;
}

const Wrapper = styled.span`
  display: inline-block;
  position: relative;
`;

const TriggerButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${({ theme }) => theme.radii.rounded};
  color: ${({ theme }) => theme.colors.highlight};
  cursor: pointer;
  display: inline-flex;
  height: 44px;
  justify-content: center;
  opacity: 0.75;
  padding: 0;
  transition: opacity 0.2s ease;
  width: 44px;

  @media (hover: hover) {
    &:hover {
      opacity: 1;
    }
  }

  &[aria-expanded="true"] {
    opacity: 1;
  }

  &:focus-visible {
    opacity: 1;
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: -4px;
  }

  svg {
    display: block;
  }
`;

/* The transparent padding is the air between the badge and the panel's notch,
   and it bridges the gap, so moving the pointer from one to the other never
   counts as leaving. */
const Positioner = styled.span<{ $below: boolean }>`
  display: block;
  left: 50%;
  max-width: min(280px, calc(100vw - 32px));
  position: absolute;
  width: max-content;
  z-index: 500;

  ${({ $below }) =>
    $below
      ? "padding-top: 2rem; top: 100%;"
      : "padding-bottom: 2rem; bottom: 100%;"}
`;

/* The notch points at the badge. The panel is nudged sideways to stay on the
   viewport, so the notch is shifted back by the same amount (--notch-shift) and
   keeps pointing at the badge rather than at the middle of the panel. */
const Panel = styled.span<{ $below: boolean } & Themed>`
  position: relative;

  background: ${({ $dark }) => palette($dark).surface};
  border: 1px solid ${({ $dark }) => palette($dark).border};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: ${({ $dark }) => palette($dark).shadow};
  color: ${({ $dark }) => palette($dark).text};
  /* A span is inline by default: its background and border would break into
     fragments around the block-level label instead of wrapping the panel. */
  display: block;
  padding: 0.875rem 1rem;
  text-align: left;
  text-transform: none;

  &:focus {
    outline: none;
  }

  &::after {
    background: ${({ $dark }) => palette($dark).surface};
    border: 1px solid ${({ $dark }) => palette($dark).border};
    content: "";
    height: 10px;
    left: calc(50% - var(--notch-shift, 0px));
    margin-left: -5px;
    pointer-events: none;
    position: absolute;
    transform: rotate(45deg);
    width: 10px;

    ${({ $below }) =>
      $below
        ? "border-bottom: none; border-right: none; top: -5px;"
        : "border-left: none; border-top: none; bottom: -5px;"}
  }
`;

/* Below the label, set off by a hairline. The label is the first thing seen;
   this is the small print. */
const Details = styled.span<Themed>`
  border-top: 1px solid ${({ $dark }) => palette($dark).divider};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.625rem;
  padding-top: 0.625rem;
`;

/* width: 0 + min-width: 100% keeps the note from widening the panel: it wraps
   to the width of the label above it. */
const Note = styled.span<Themed>`
  color: ${({ $dark }) => palette($dark).muted};
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  line-height: 1.45;
  min-width: 100%;
  width: 0;
`;

/* Teal on both surfaces: the light theme's deeper teal on white, the dark
   theme's brighter one on the dark card. */
const ForestLink = styled.a<Themed>`
  align-items: center;
  color: ${({ $dark }) => palette($dark).linkColor};
  display: inline-flex;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  gap: 0.25rem;
  text-decoration: underline;
  text-decoration-color: ${({ $dark }) => palette($dark).linkUnderline};
  text-underline-offset: 3px;
  transition:
    color 0.2s ease,
    text-decoration-color 0.2s ease;
  width: fit-content;

  @media (hover: hover) {
    &:hover {
      color: ${({ $dark }) => palette($dark).linkHover};
      text-decoration-color: currentColor;
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ $dark }) => palette($dark).linkColor};
    outline-offset: 3px;
  }
`;

const TreeNationPopover: React.FC<TreeNationPopoverProps> = ({
  ariaLabel,
  note,
  linkHref,
  linkLabel,
  className,
}) => {
  const id = useId();
  const dark = useColorScheme() === "dark";
  const [open, setOpen] = useState(false);
  const [below, setBelow] = useState(false);
  const [shiftX, setShiftX] = useState(0);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const positionerRef = useRef<HTMLSpanElement>(null);
  const pinnedRef = useRef(false);
  /* Escape hands focus back to the badge, which must not reopen it. */
  const restoringFocusRef = useRef(false);

  const hide = () => {
    pinnedRef.current = false;
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const focusInside = wrapperRef.current?.contains(document.activeElement);
      hide();
      if (focusInside) {
        restoringFocusRef.current = true;
        triggerRef.current?.focus();
        restoringFocusRef.current = false;
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) hide();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  /* Collision handling, measured once the panel is in the DOM. */
  useLayoutEffect(() => {
    if (!open) return;
    setBelow(false);
    setShiftX(0);
    const frame = requestAnimationFrame(() => {
      const rect = positionerRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (rect.top < 8) setBelow(true);
      const overflowRight = rect.right - (window.innerWidth - 16);
      const overflowLeft = 16 - rect.left;
      if (overflowRight > 0) setShiftX(-overflowRight);
      else if (overflowLeft > 0) setShiftX(overflowLeft);
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  /* Keyboard focus shows it too (a mouse click focuses the button as well, but
     that goes through onClick). Without :focus-visible support, assume keys. */
  const onFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (restoringFocusRef.current) return;
    let keyboard = true;
    try {
      keyboard = e.currentTarget.matches(":focus-visible");
    } catch {
      /* unsupported selector */
    }
    if (keyboard) setOpen(true);
  };

  const onClick = () => {
    if (open && pinnedRef.current) {
      hide();
      return;
    }
    pinnedRef.current = true;
    setOpen(true);
  };

  return (
    <Wrapper
      ref={wrapperRef}
      className={className}
      onMouseEnter={() => {
        if (window.matchMedia?.("(hover: hover)").matches) setOpen(true);
      }}
      onMouseLeave={() => {
        if (!pinnedRef.current) setOpen(false);
      }}
      onBlur={(e) => {
        const next = e.relatedTarget as Node | null;
        if (next && !wrapperRef.current?.contains(next)) hide();
      }}
    >
      <TriggerButton
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-haspopup="dialog"
        onClick={onClick}
        onFocus={onFocus}
      >
        <BadgeCheck size={20} strokeWidth={1.75} aria-hidden="true" />
      </TriggerButton>
      {open && (
        <Positioner
          ref={positionerRef}
          $below={below}
          style={
            {
              "--notch-shift": `${shiftX}px`,
              transform: `translateX(calc(-50% + ${shiftX}px))`,
            } as React.CSSProperties
          }
        >
          <Panel
            id={id}
            role="dialog"
            aria-label={ariaLabel}
            tabIndex={-1}
            $below={below}
            $dark={dark}
          >
            <TreeNationLabel type="tree-counter" />
            <Details $dark={dark}>
              <Note $dark={dark}>{note}</Note>
              <ForestLink
                $dark={dark}
                href={linkHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {linkLabel}
                <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
              </ForestLink>
            </Details>
          </Panel>
        </Positioner>
      )}
    </Wrapper>
  );
};

export default TreeNationPopover;
