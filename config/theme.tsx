import { ThemeProvider } from "styled-components";

import { button, link } from "./componentThemes";
import {
  colors,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  radii,
  space,
  typography,
} from "./customizations";

export const theme = {
  colors,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  radii,
  space,
  typography,
  components: {
    button,
    link,
  },
};

const Theme = ({ children }: any) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

export default Theme;
