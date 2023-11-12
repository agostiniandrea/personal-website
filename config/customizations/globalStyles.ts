import { theme } from "@config/theme";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Open Sans';
    font-weight: normal;
    font-style: normal;
    src: url('/assets/fonts/static/Open_Sans/Open_Sans-Regular.woff') format('woff'), /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
      url('/assets/fonts/static/Open_Sans/Open_Sans-Regular.woff2') format('woff2'); /* Chrome 26+, Opera 23+, Firefox 39+ */
    font-display: swap;
  }

  @font-face {
    font-family: 'Montserrat';
    font-weight: normal;
    font-style: normal;
    src: url('/assets/fonts/static/Montserrat/Montserrat-Regular.woff'), /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
      url('/assets/fonts/static/Montserrat/Montserrat-Regular.woff2') format('woff2'); /* Chrome 26+, Opera 23+, Firefox 39+ */
    font-display: swap;
  }

  @font-face {
    font-family: 'Lato';
    font-weight: normal;
    font-style: normal;
    src: url('/assets/fonts/Lato/Lato-Regular.woff') format('woff'), /* Chrome 6+, Firefox 3.6+, IE 9+, Safari 5.1+ */
      url('/assets/fonts/Lato/Lato-Regular.woff2') format('woff2'); /* Chrome 26+, Opera 23+, Firefox 39+ */
    font-display: swap;
  }

  body {
    background: ${theme.colors.background};
    color: ${theme.colors.main};
    font-family: 'Open Sans', sans-serif;
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
