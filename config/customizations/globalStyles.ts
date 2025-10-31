import { createGlobalStyle, css } from "styled-components";

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    @font-face {
      font-family: "Rainier";
      font-weight: 500;
      font-style: normal;
      src:
        url("/assets/fonts/Rainier/RainierNorth500.woff2") format("woff2"),
        url("/assets/fonts/Rainier/RainierNorth500.woff") format("woff");
      font-display: block;
    }
    
    @font-face {
      font-family: "Rainier";
      font-weight: 400;
      font-style: normal;
      src:
        url("/assets/fonts/Rainier/RainierNorth500.woff2") format("woff2"),
        url("/assets/fonts/Rainier/RainierNorth500.woff") format("woff");
      font-display: block;
    }
    
    @font-face {
      font-family: "Rainier";
      font-weight: 700;
      font-style: normal;
      src:
        url("/assets/fonts/Rainier/RainierNorth500.woff2") format("woff2"),
        url("/assets/fonts/Rainier/RainierNorth500.woff") format("woff");
      font-display: block;
    }

    html {
      background: ${theme.colors.background};
    }

    body {
      background: ${theme.colors.background};
      color: ${theme.colors.main};
      font-size: 24px;
      font-family: "Rainier", sans-serif;
      margin: 0;
      overflow-x: hidden;
      padding: 0;
      scroll-behavior: smooth;
      /* Prevent flash of unstyled content */
      visibility: visible;
      /* Ensure font rendering is stable during resize */
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
