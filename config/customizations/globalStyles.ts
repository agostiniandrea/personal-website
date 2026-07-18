import { createGlobalStyle, css } from "styled-components";

import { VIEW_SECTIONS } from "@lib/utils/mobileNav";

/* App-like mobile tabs: below the desktop-nav breakpoint, when the
   pre-hydration script has resolved a view, only that view's sections stay
   visible. Without JS the attribute is absent and the page keeps its full
   one-page layout. */
const MANAGED_SECTION_IDS = Array.from(
  new Set(Object.values(VIEW_SECTIONS).flat())
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

    /* color tokens — dark (default) */
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
    --color-badge-bg: rgba(45, 212, 191, 0.08);
    --color-ring-start: #2dd4bf;
    --color-ring-end: #34d399;
  }

  @media (prefers-color-scheme: light) {
    :root {
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
    --color-badge-bg: rgba(15, 118, 110, 0.07);
    --color-ring-start: #0f766e;
    --color-ring-end: #059669;
  }

  :root[data-theme="dark"] {
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
      background: ${theme.colors.background};
      color: ${theme.colors.main};
      font-size: 18px;
      font-family: var(--font-inter), sans-serif;
      margin: 0;
      overflow-x: hidden;
      padding: 0;
      scroll-behavior: smooth;
      visibility: visible;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
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
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    main {
      padding-top: 0;
      margin-top: 0;
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
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    @media (max-width: 899.98px) {
      ${mobileTabRules}
      ${storySubRules}

      /* Room for the fixed bottom navigation (+ iOS home indicator) */
      html[data-mobile-view] main {
        padding-bottom: calc(4.5rem + env(safe-area-inset-bottom) + 1.5rem);
      }
      html[data-mobile-view] footer[role="contentinfo"] {
        padding-bottom: calc(1.5rem + 4.5rem + env(safe-area-inset-bottom));
      }
    }
  `}
`;

export default GlobalStyle;
