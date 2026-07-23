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

const GlobalStyle = createGlobalStyle`
  :root {
    --font-inter: "Inter", sans-serif;
    --font-space-grotesk: "Space Grotesk", sans-serif;

    /* Height of the fixed site header — single source of truth. SiteHeader
       sizes itself from it, and every fixed-header offset reads it back, so
       the two can never drift apart. */
    --site-header-height: 3.5rem;

    /* Height of the fixed bottom tab bar (excluding the safe-area inset);
       everything that offsets around it reads this back. */
    --mobile-nav-height: 4.75rem;

    @media (min-width: ${BREAKPOINTS.xTablet}) {
      --site-header-height: 4.3125rem;
    }

    /* color tokens — dark (default) */
    --artwork-opacity: 0.22;
    --color-background: #0a0a0f;
    --color-headline: #ffffff;
    --color-paragraph: #a0a0b0;
    --color-button: #0d9488;
    --color-button-text: #ffffff;
    --color-stroke: #0f2a28;
    --color-main: #a0a0b0;
    --color-highlight: #2dd4bf;
    --color-secondary: #ffffff;
    --color-tertiary: #2dd4bf;
    --color-surface: rgba(45, 212, 191, 0.04);
    --color-surface-raised: #203c34;
    --color-badge-bg: rgba(45, 212, 191, 0.08);
    --color-ring-start: #2dd4bf;
    --color-ring-end: #34d399;
  }

  @media (prefers-color-scheme: light) {
    :root {
      --artwork-opacity: 0.35;
      --artwork-opacity: 0.35;
    --color-background: #f5f5fa;
      --color-headline: #0a0a0f;
      --color-paragraph: #5e5e72;
      --color-button: #0f766e;
      --color-button-text: #ffffff;
      --color-stroke: #c8e6e4;
      --color-main: #c0c0d4;
      --color-highlight: #0f766e;
      --color-secondary: #0a0a0f;
      --color-tertiary: #0f766e;
      --color-surface: rgba(15, 118, 110, 0.04);
      --color-surface-raised: #eaf1e6;
      --color-badge-bg: rgba(15, 118, 110, 0.07);
      --color-ring-start: #0f766e;
      --color-ring-end: #059669;
    }
  }

  /* Storybook theme toggle — mirrors prefers-color-scheme via data-theme attribute */
  :root[data-theme="light"] {
    --color-background: #f5f5fa;
    --color-headline: #0a0a0f;
    --color-paragraph: #5e5e72;
    --color-button: #0f766e;
    --color-button-text: #ffffff;
    --color-stroke: #c8e6e4;
    --color-main: #c0c0d4;
    --color-highlight: #0f766e;
    --color-secondary: #0a0a0f;
    --color-tertiary: #0f766e;
    --color-surface: rgba(15, 118, 110, 0.04);
    --color-surface-raised: #eaf1e6;
    --color-badge-bg: rgba(15, 118, 110, 0.07);
    --color-ring-start: #0f766e;
    --color-ring-end: #059669;
  }

  :root[data-theme="dark"] {
    --artwork-opacity: 0.22;
    --color-background: #0a0a0f;
    --color-headline: #ffffff;
    --color-paragraph: #a0a0b0;
    --color-button: #0d9488;
    --color-button-text: #ffffff;
    --color-stroke: #0f2a28;
    --color-main: #a0a0b0;
    --color-highlight: #2dd4bf;
    --color-secondary: #ffffff;
    --color-tertiary: #2dd4bf;
    --color-surface: rgba(45, 212, 191, 0.04);
    --color-surface-raised: #203c34;
    --color-badge-bg: rgba(45, 212, 191, 0.08);
    --color-ring-start: #2dd4bf;
    --color-ring-end: #34d399;
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
      font-family: var(--font-inter), sans-serif;
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

      /* Every mobile view starts below the fixed site header, and leaves room
         for the fixed bottom navigation (the footer reserves the rest). */
      html[data-mobile-view] main {
        padding-bottom: 1rem;
        padding-top: var(--site-header-height);
      }

      html[data-mobile-view] footer[role="contentinfo"] {
        padding-bottom: calc(
          1.5rem + var(--mobile-nav-height) + env(safe-area-inset-bottom)
        );
      }
    }
  `}
`;

export default GlobalStyle;
