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
import { DefaultTheme } from 'styled-components';
import breakpoints from '../constants/breakpoints';

const theme: DefaultTheme = {
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
};

export default theme;
