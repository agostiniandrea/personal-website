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
import breakpoints from "../constants/breakpoints";
import { DefaultTheme } from "styled-components";

const theme = {
  colors,
  fontFamilies,
  fontSizes,
  fontWeights,
  lineHeights,
  radii,
  space,
  typography,
  breakpoints,
  components: {
    button,
    link,
  },
} as unknown as DefaultTheme;

export default theme;
