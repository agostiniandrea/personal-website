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
  breakpoints,
  components: {
    button,
    link,
  },
} as unknown as DefaultTheme;

export default theme;
