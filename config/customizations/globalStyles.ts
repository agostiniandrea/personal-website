import { createGlobalStyle, css } from "styled-components";

const GlobalStyle = createGlobalStyle`
  :root {
    --font-inter: "Inter", sans-serif;
    --font-space-grotesk: "Space Grotesk", sans-serif;
  }

  ${({ theme }) => css`
    html {
      background: ${theme.colors.background};
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
      text-decoration: none;
    }

    ul {
      list-style: none;
    }
  `}
`;

export default GlobalStyle;
