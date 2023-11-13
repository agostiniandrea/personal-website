import { theme } from "@config/theme";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Rainier';
    font-weight: normal;
    font-style: normal;
    src: url('/assets/fonts/Rainier/RainierNorth500.woff') format('woff'), /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
      url('/assets/fonts/Rainier/RainierNorth500.woff2') format('woff2'); /* Chrome 26+, Opera 23+, Firefox 39+ */
    font-display: swap;
  }

  body {
    background: ${theme.colors.background};
    color: ${theme.colors.main};
    font-size: 24px;
    font-family: 'Rainier', sans-serif;
    margin: 0;
    overflow-x: hidden;
    padding: 0;
    scroll-behavior: smooth;
  }

  p, ul, h1, h2, h3, h4, h5, h6 {
    margin: 0;
    padding: 0;
  }

  a {
    text-decoration: none;
  }

  ul {
    list-style: none;
  }
`;

export default GlobalStyle;
