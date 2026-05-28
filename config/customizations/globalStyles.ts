import { createGlobalStyle, css } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root {
    --font-inter: "Inter", sans-serif;
    --font-space-grotesk: "Space Grotesk", sans-serif;

    /* color tokens — dark (default) */
    --color-background: #0a0a0f;
    --color-headline: #ffffff;
    --color-paragraph: #a0a0b0;
    --color-button: #1d4ed8;
    --color-button-text: #ffffff;
    --color-stroke: #1a1a2e;
    --color-main: #a0a0b0;
    --color-highlight: #3b82f6;
    --color-secondary: #ffffff;
    --color-tertiary: #3b82f6;
  }

  @media (prefers-color-scheme: light) {
    :root {
      --color-background: #f5f5fa;
      --color-headline: #0a0a0f;
      --color-paragraph: #6a6a80;
      --color-button: #1d4ed8;
      --color-button-text: #ffffff;
      --color-stroke: #d0d0e4;
      --color-main: #c0c0d4;
      --color-highlight: #1d4ed8;
      --color-secondary: #0a0a0f;
      --color-tertiary: #1d4ed8;
    }
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
  `}
`;

export default GlobalStyle;
