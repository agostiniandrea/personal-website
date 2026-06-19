import { Breakpoints } from "../../constants/breakpoints";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      background: string;
      headline: string;
      paragraph: string;
      button: string;
      button_text: string;
      stroke: string;
      main: string;
      highlight: string;
      secondary: string;
      tertiary: string;
      surface: string;
      badgeBg: string;
      ringStart: string;
      ringEnd: string;
    };
    fontFamilies: {
      default: string;
      heading: string;
    };
    fontSizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      "2xl": string;
      "3xl": string;
      "4xl": string;
      "5xl": string;
      "6xl": string;
    };
    fontWeights: {
      regular: number;
      medium: number;
      semiBold: number;
      bold: number;
    };
    lineHeights: {
      tight: number;
      snug: number;
      normal: number;
      base: number;
      relaxed: number;
      loose: number;
    };
    radii: {
      none: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      rounded: string;
      full: string;
    };
    space: {
      0: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      "2xl": string;
      "3xl": string;
      "4xl": string;
      "5xl": string;
      "6xl": string;
      "7xl": string;
      "8xl": string;
    };
    breakpoints: Breakpoints;
    components: {
      button: Record<string, unknown>;
      link: Record<string, unknown>;
    };
  }
}
