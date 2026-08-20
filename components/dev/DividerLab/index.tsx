/* TEMPORARY — switcher + stylesheet for the section-divider comparison.
   Every variant is CSS keyed on the data-divider attribute, so no production
   component is touched while comparing. Delete with lib/utils/dividerLab once
   a variant is chosen (or once we decide none of them earns its place). */

import styled, { createGlobalStyle } from "styled-components";

import {
  DIVIDER_LABELS,
  DIVIDER_VARIANTS,
  useDividerLabEnabled,
  useDividerVariant,
} from "@lib/utils/dividerLab";

/* Placement is the same for all three marks: pulled up by exactly the
   section's own padding-top, which lands it on the section boundary — the
   midpoint of the 96px gap, since the section above contributes the same
   padding below. The margins net to zero, so nothing on the page moves.

   Sections without an id are interstitials (the Forest teaser, 12px tall);
   marking them would double the rhythm rather than clarify it. And below
   xTablet the tab bar shows one view at a time, so sections are rarely
   adjacent and a divider has nothing to divide. */
const DividerStyles = createGlobalStyle`
  @media (min-width: 900px) {
    html[data-divider] main#main-content > section {
      --dv-offset: 3rem;
    }

    @media (max-width: 1199.98px) {
      html[data-divider] main#main-content > section {
        --dv-offset: 2rem;
      }
    }

    /* 2 · Linea tenue — full-bleed, card border colour, no teal */
    html[data-divider="subtle"]
      main#main-content
      > section[id]:not(#hero)::before {
      background: ${({ theme }) => theme.colors.border};
      content: "";
      display: block;
      height: 1px;
      margin: calc(var(--dv-offset) * -1) 0 calc(var(--dv-offset) - 1px);
      opacity: 0.22;
    }

    /* 3 · Linea del container — same column the content sits in. The pseudo
       needs its own grid-column because the Container places children with a
       child-universal rule, which never matches a pseudo-element. */
    html[data-divider="container"]
      main#main-content
      > section[id]:not(#hero)
      > *::before {
      background: ${({ theme }) => theme.colors.border};
      content: "";
      display: block;
      grid-column: 2 / auto;
      height: 1px;
      margin: calc(var(--dv-offset) * -1) 0 calc(var(--dv-offset) - 1px);
      opacity: 0.22;
    }

    /* 4 · Signature — one 6px circle, the exact mark the section dots already
       use, in the neutral border colour rather than their teal so it reads as
       punctuation instead of as a control. */
    html[data-divider="signature"]
      main#main-content
      > section[id]:not(#hero)::before {
      background: ${({ theme }) => theme.colors.border};
      border-radius: 100%;
      content: "";
      display: block;
      height: 6px;
      margin: calc(var(--dv-offset) * -1) auto calc(var(--dv-offset) - 6px);
      opacity: 0.3;
      width: 6px;
    }

    /* 5 · Soft gradient — the accent green pulled most of the way toward the
       neutral border colour, so it reads as a change of air rather than as a
       coloured rule, and faded to nothing at both ends so no hard line ever
       crosses the page. Height stays 1px and the margins net to zero, so the
       sections do not grow. */
    html[data-divider="gradient"]
      main#main-content
      > section[id]:not(#hero)::before {
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(
            in srgb,
            ${({ theme }) => theme.colors.highlight} 38%,
            ${({ theme }) => theme.colors.border}
          )
          50%,
        transparent 100%
      );
      content: "";
      display: block;
      height: 1px;
      margin: calc(var(--dv-offset) * -1) 0 calc(var(--dv-offset) - 1px);
      opacity: 0.55;
    }

    /* 6 · Soft organic wave — the same desaturated colour, painted through an
       SVG mask rather than a background image so the curve follows the theme
       instead of baking a colour into a data URI. The box is 28px tall but is
       pulled up by half of that on top of the usual offset, so its midline
       lands on the section boundary and the height still nets to zero. */
    html[data-divider="wave"]
      main#main-content
      > section[id]:not(#hero)::before {
      background: color-mix(
        in srgb,
        ${({ theme }) => theme.colors.highlight} 38%,
        ${({ theme }) => theme.colors.border}
      );
      content: "";
      display: block;
      height: 28px;
      margin: calc(var(--dv-offset) * -1 - 14px) 0 calc(var(--dv-offset) - 14px);
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 28' preserveAspectRatio='none'%3E%3Cpath d='M0 14 C 320 5, 560 23, 840 14 S 1080 6, 1200 14' fill='none' stroke='white' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E");
      mask-repeat: no-repeat;
      mask-size: 100% 100%;
      opacity: 0.5;
      -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 28' preserveAspectRatio='none'%3E%3Cpath d='M0 14 C 320 5, 560 23, 840 14 S 1080 6, 1200 14' fill='none' stroke='white' stroke-width='1.4' stroke-linecap='round'/%3E%3C/svg%3E");
      -webkit-mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
    }
  }
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(128, 128, 128, 0.32);
  border-radius: ${({ theme }) => theme.radii.sm};
  bottom: ${({ theme }) => theme.space.lg};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xs};
  left: ${({ theme }) => theme.space.lg};
  padding: ${({ theme }) => theme.space.md};
  position: fixed;
  z-index: 9998;
`;

const Caption = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Choice = styled.button<{ $active: boolean }>`
  background: ${({ $active, theme }) =>
    $active ? theme.colors.button : "transparent"};
  border: 1px solid rgba(128, 128, 128, 0.24);
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.button_text : theme.colors.headline};
  cursor: pointer;
  font-family: inherit;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  min-height: 32px;
  padding: 0 ${({ theme }) => theme.space.md};
  text-align: left;
  white-space: nowrap;
`;

const DividerLab: React.FC = () => {
  const enabled = useDividerLabEnabled();
  const { setVariant, variant } = useDividerVariant();

  if (!enabled) return null;

  return (
    <>
      <DividerStyles />
      <Panel aria-label="Section divider lab">
        <Caption>divider</Caption>
        {DIVIDER_VARIANTS.map((option) => (
          <Choice
            key={option}
            type="button"
            $active={option === variant}
            aria-pressed={option === variant}
            onClick={() => setVariant(option)}
          >
            {DIVIDER_LABELS[option]}
          </Choice>
        ))}
      </Panel>
    </>
  );
};

export default DividerLab;
