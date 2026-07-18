import React, {
  ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import styled from "styled-components";

/* Compact, accessible clarification popover: hover/focus open it on
   pointer-fine devices, tap toggles it on touch, Escape / outside click /
   focus loss close it. Only one instance is ever open (coordinated through
   a window event). Not a modal: it never traps focus. */

const SINGLETON_EVENT = "infotooltip:open";

export interface InfoTooltipProps {
  ariaLabel: string;
  children: ReactNode;
  /* Fired once per open interaction, not on rerenders */
  onOpen?: () => void;
  defaultOpen?: boolean;
}

const Wrapper = styled.span`
  display: inline-block;
  position: relative;
`;

const TriggerButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.paragraph};
  cursor: pointer;
  display: inline-flex;
  height: 44px;
  justify-content: center;
  /* 44px touch target without disturbing the metric line's rhythm */
  margin: -13px -10px -13px -8px;
  opacity: 0.65;
  transition: opacity 0.2s ease;
  vertical-align: middle;
  width: 44px;

  @media (hover: hover) {
    &:hover {
      opacity: 1;
    }
  }

  &:focus-visible {
    border-radius: ${({ theme }) => theme.radii.rounded};
    opacity: 1;
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: -10px;
  }

  svg {
    display: block;
  }
`;

const Bubble = styled.span<{ $below: boolean }>`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(128, 128, 128, 0.25);
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.18);
  color: ${({ theme }) => theme.colors.headline};
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.regular};
  left: 50%;
  line-height: ${({ theme }) => theme.lineHeights.base};
  max-width: min(280px, calc(100vw - 32px));
  padding: ${({ theme }) => theme.space.md} ${({ theme }) => theme.space.lg};
  position: absolute;
  text-align: left;
  text-transform: none;
  white-space: normal;
  width: max-content;
  z-index: 500;

  ${({ $below }) =>
    $below ? "top: calc(100% + 8px);" : "bottom: calc(100% + 8px);"}
`;

const InfoTooltip: React.FC<InfoTooltipProps> = ({
  ariaLabel,
  children,
  onOpen,
  defaultOpen = false,
}) => {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  const [below, setBelow] = useState(false);
  const [shiftX, setShiftX] = useState(0);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const pinnedRef = useRef(false);

  const show = (pinned: boolean) => {
    pinnedRef.current = pinned;
    if (open) return;
    onOpen?.();
    window.dispatchEvent(new CustomEvent(SINGLETON_EVENT, { detail: id }));
    setOpen(true);
  };

  const hide = () => {
    pinnedRef.current = false;
    setOpen(false);
  };

  /* Only one tooltip visible at a time */
  useEffect(() => {
    const onAnyOpen = (e: Event) => {
      if ((e as CustomEvent).detail !== id) hide();
    };
    window.addEventListener(SINGLETON_EVENT, onAnyOpen);
    return () => window.removeEventListener(SINGLETON_EVENT, onAnyOpen);
  }, [id]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") hide();
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

  /* Collision handling: prefer above, flip below when clipped by the top of
     the viewport, clamp horizontally to a 16px margin */
  useLayoutEffect(() => {
    if (!open) return;
    setBelow(false);
    setShiftX(0);
    requestAnimationFrame(() => {
      const bubble = bubbleRef.current;
      if (!bubble) return;
      const rect = bubble.getBoundingClientRect();
      if (rect.top < 8) setBelow(true);
      const overflowRight = rect.right - (window.innerWidth - 16);
      const overflowLeft = 16 - rect.left;
      if (overflowRight > 0) setShiftX(-overflowRight);
      else if (overflowLeft > 0) setShiftX(overflowLeft);
    });
  }, [open]);

  return (
    <Wrapper
      ref={wrapperRef}
      onMouseEnter={() => {
        if (window.matchMedia("(hover: hover)").matches) show(false);
      }}
      onMouseLeave={() => {
        if (!pinnedRef.current) hide();
      }}
    >
      <TriggerButton
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => (pinnedRef.current ? hide() : show(true))}
        onFocus={() => show(false)}
        onBlur={() => hide()}
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9.5" />
          <path d="M12 11v6" />
          <path d="M12 7.5v.5" />
        </svg>
      </TriggerButton>
      {open && (
        <Bubble
          ref={bubbleRef}
          id={id}
          role="tooltip"
          $below={below}
          style={{ transform: `translateX(calc(-50% + ${shiftX}px))` }}
        >
          {children}
        </Bubble>
      )}
    </Wrapper>
  );
};

export default InfoTooltip;
