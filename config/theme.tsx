import { DefaultTheme } from "styled-components";

import breakpoints from "../constants/breakpoints";
import { button, link } from "./componentThemes";
import {
  colors,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  radii,
  space,
} from "./customizations";

const theme = {
  colors,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  radii,
  space,
  breakpoints,
  components: {
    button,
    link,
  },
} as unknown as DefaultTheme;

export default theme;
