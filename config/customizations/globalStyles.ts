import { createGlobalStyle, css } from "styled-components";

import { BREAKPOINTS, BREAKPOINTS_BELOW } from "@constants";
import { VIEW_SECTIONS } from "@lib/utils/mobileNav";

/* App-like mobile tabs: below the desktop-nav breakpoint, when the
   pre-hydration script has resolved a view, only that view's sections stay
   visible. Without JS the attribute is absent and the page keeps its full
   one-page layout. */
const MANAGED_SECTION_IDS = Array.from(
  new Set(Object.values(VIEW_SECTIONS).flat()),
);

const mobileTabRules = Object.entries(VIEW_SECTIONS)
  .map(([view, visible]) => {
    const hidden = MANAGED_SECTION_IDS.filter((id) => !visible.includes(id));
    const selectors = hidden
      .map((id) => `html[data-mobile-view="${view}"] main #${id}`)
      .join(",\n");
    return `${selectors} { display: none; }`;
  })
  .join("\n");

const storySubRules = `
  html[data-mobile-view="story"][data-story-sub="journey"] main #experience { display: none; }
  html[data-mobile-view="story"][data-story-sub="experience"] main #journey { display: none; }
`;

/* Colour tokens, one list per theme, so the three places that apply them
   (the default, the OS preference and the explicit data-theme choice) can
   never drift apart.

   Palette (brief): Forest #174F49, Ivory #F3EFE5, Sage #86A99A, Ochre #DDA04D,
   Clay #C96F53, Paper #FAF8F3, Sand #E6E1D6, Charcoal #292C29, Muted #77776F.

   Contrast, measured: Muted on Paper is only 4.25:1, so body text uses the
   darker #5A5B54 (5.3:1 even on Sand) and Muted stays decorative. Ochre and
   Clay are accents for fills, rules and large display type: as small text on
   a light ground they need the darker --color-milestone / --color-clay-text. */
const LIGHT_TOKENS = `
    --artwork-opacity: 0.35;
    --color-background: #faf8f3;
    --color-headline: #292c29;
    --color-paragraph: #5a5b54;
    --color-button: #174f49;
    --color-button-text: #ffffff;
    --color-stroke: #d9e2da;
    --color-main: #5a5b54;
    /* Section dividers: quiet on purpose, never used for text. */
    --color-border: #d3ccbc;
    --color-highlight: #174f49;
    --logo-shine-from: #174f49;
    --logo-shine-to: #2f7a6d;
    --color-secondary: #292c29;
    --color-tertiary: #174f49;
    --color-surface: #f3efe5;
    --color-surface-raised: #e6e1d6;
    --color-badge-bg: rgba(23, 79, 73, 0.08);
    --color-ring-start: #174f49;
    --color-ring-end: #2f7a6d;
    --color-milestone: #8a5b14;
    --color-thai-navy: #2d2a4a;
    --color-clay-text: #a5472b;
    --color-header-bg: rgba(243, 239, 229, 0.92);
`;

const DARK_TOKENS = `
    --artwork-opacity: 0.22;
    --color-background: #0f1b19;
    --color-headline: #f3efe5;
    --color-paragraph: #b9bdb3;
    /* Sage fill with dark label: 6.9:1. A forest fill would vanish on this
       ground. */
    --color-button: #86a99a;
    --color-button-text: #0f1b19;
    --color-stroke: #1d332e;
    --color-main: #b9bdb3;
    --color-border: #34493f;
    --color-highlight: #86a99a;
    --logo-shine-from: #86a99a;
    --logo-shine-to: #c4dccf;
    --color-secondary: #f3efe5;
    --color-tertiary: #86a99a;
    --color-surface: #162623;
    --color-surface-raised: #1d332e;
    --color-badge-bg: rgba(134, 169, 154, 0.12);
    --color-ring-start: #86a99a;
    --color-ring-end: #c4dccf;
    --color-milestone: #dda04d;
    --color-thai-navy: var(--color-headline);
    --color-clay-text: #e08a6e;
    --color-header-bg: rgba(15, 27, 25, 0.92);
`;

const GlobalStyle = createGlobalStyle`
  :root {
    --font-manrope: "Manrope", sans-serif;
    --font-newsreader: "Newsreader", Georgia, serif;

    /* Height of the fixed site header — single source of truth. SiteHeader
       sizes itself from it, and every fixed-header offset reads it back, so
       the two can never drift apart. */
    --site-header-height: 3.5rem;

    /* Height of the fixed bottom tab bar (excluding the safe-area inset);
       everything that offsets around it reads this back. Matches the real
       rendered bar (~62px) so clearances don't over-reserve space. */
    --mobile-nav-height: 4rem;

    @media (min-width: ${BREAKPOINTS.xTablet}) {
      --site-header-height: 4.3125rem;
    }

    /* The brand palette itself, theme-independent. Components read the
       semantic --color-* tokens below; these exist for the few places that
       need the exact brand value (photo overlays, accents on images). */
    --palette-forest: #174f49;
    --palette-ivory: #f3efe5;
    --palette-sage: #86a99a;
    --palette-ochre: #dda04d;
    --palette-clay: #c96f53;
    --palette-paper: #faf8f3;
    --palette-sand: #e6e1d6;
    --palette-charcoal: #292c29;
    --palette-muted: #77776f;

    /* Text that sits on photography or the forest panel is always ivory. */
    --color-on-image: #f3efe5;
    --color-on-image-muted: rgba(243, 239, 229, 0.82);

    /* color tokens — dark (default) */
    ${DARK_TOKENS}
  }

  @media (prefers-color-scheme: light) {
    :root {
      ${LIGHT_TOKENS}
    }
  }

  /* Explicit visitor choice (and the Storybook toggle) — mirrors
     prefers-color-scheme via the data-theme attribute. Higher specificity than
     both the bare :root and the media-query :root, so it wins in either
     direction: light on a dark system and dark on a light one. */
  :root[data-theme="light"] {
    ${LIGHT_TOKENS}
  }

  :root[data-theme="dark"] {
    ${DARK_TOKENS}
  }

  ${({ theme }) => css`
    html {
      background: ${theme.colors.background};
      overflow-y: scroll;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
    }

    body {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background: ${theme.colors.background};
      color: ${theme.colors.main};
      font-family: var(--font-manrope), sans-serif;
      font-size: 18px;
      margin: 0;
      overflow-x: hidden;
      padding: 0;
      scroll-behavior: smooth;
      text-rendering: optimizeLegibility;
      visibility: visible;
    }

    p,
    ul,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 0;
      padding: 0;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    :focus-visible {
      outline: 2px solid ${theme.colors.highlight};
      outline-offset: 3px;
      border-radius: 2px;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: var(--color-headline);
    }

    ul {
      list-style: none;
    }

    .sr-only {
      border: 0;
      clip: rect(0, 0, 0, 0);
      height: 1px;
      margin: -1px;
      overflow: hidden;
      padding: 0;
      position: absolute;
      white-space: nowrap;
      width: 1px;
    }

    main {
      margin-top: 0;
      padding-top: 0;
    }

    section[id] {
      scroll-margin-top: 5rem;
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
      }
    }

    @media (max-width: ${BREAKPOINTS_BELOW.xTablet}) {
      ${mobileTabRules}
      ${storySubRules}

      /* The footer is hidden on mobile, so main itself starts below the fixed
         header and clears the fixed tab bar — otherwise the last section would
         hide behind it. */
      html[data-mobile-view] main {
        padding-bottom: calc(
          var(--mobile-nav-height) + env(safe-area-inset-bottom)
        );
        padding-top: var(--site-header-height);
      }
    }
  `}
`;

export default GlobalStyle;
