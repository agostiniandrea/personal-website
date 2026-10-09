import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { ArrowUpRight, BadgeCheck } from "lucide-react";
import styled from "styled-components";

import TreeNationLabel from "../TreeNationLabel";

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
   The panel is always white, whatever the site theme, so the official label
   (rendered in its light theme) reads exactly as Tree-Nation designed it. */

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
const Panel = styled.span<{ $below: boolean }>`
  position: relative;

  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
  color: #1a1a1a;
  padding: 0.875rem 1rem;
  text-align: left;
  text-transform: none;

  &:focus {
    outline: none;
  }

  &::after {
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.12);
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
const Details = styled.span`
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.625rem;
  padding-top: 0.625rem;
`;

/* width: 0 + min-width: 100% keeps the note from widening the panel: it wraps
   to the width of the label above it. */
const Note = styled.span`
  color: #5b6470;
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  line-height: 1.45;
  min-width: 100%;
  width: 0;
`;

/* The panel is always white, so the link uses the light theme's teal (#0f766e)
   rather than the theme's own accent, which turns pale in dark mode. */
const ForestLink = styled.a`
  align-items: center;
  color: #0f766e;
  display: inline-flex;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  gap: 0.25rem;
  text-decoration: underline;
  text-decoration-color: rgba(15, 118, 110, 0.35);
  text-underline-offset: 3px;
  transition:
    color 0.2s ease,
    text-decoration-color 0.2s ease;
  width: fit-content;

  @media (hover: hover) {
    &:hover {
      color: #0b5f58;
      text-decoration-color: currentColor;
    }
  }

  &:focus-visible {
    outline: 2px solid #0f766e;
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
          >
            <TreeNationLabel type="tree-counter" theme="light" />
            <Details>
              <Note>{note}</Note>
              <ForestLink
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
