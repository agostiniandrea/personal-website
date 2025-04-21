import { DefaultTheme } from 'styled-components';
import { Breakpoints } from '../../constants/breakpoints';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      accent: string;
    };
    fontFamilies: {
      body: string;
      heading: string;
    };
    fontSizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
    };
    fontWeights: {
      normal: number;
      medium: number;
      bold: number;
    };
    lineHeights: {
      small: string;
      regular: string;
      semiControl: string;
      control: string;
      heading: string;
    };
    radii: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      full: string;
    };
    space: {
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      8: string;
      10: string;
      12: string;
      16: string;
      20: string;
      24: string;
      32: string;
      40: string;
      48: string;
      56: string;
      64: string;
    };
    breakpoints: Breakpoints;
    typography: {
      h1: {
        fontSize: string;
        fontWeight: number;
        lineHeight: string;
      };
      h2: {
        fontSize: string;
        fontWeight: number;
        lineHeight: string;
      };
      h3: {
        fontSize: string;
        fontWeight: number;
        lineHeight: string;
      };
      h4: {
        fontSize: string;
        fontWeight: number;
        lineHeight: string;
      };
      h5: {
        fontSize: string;
        fontWeight: number;
        lineHeight: string;
      };
      h6: {
        fontSize: string;
        fontWeight: number;
        lineHeight: string;
      };
      body: {
        fontSize: string;
        fontWeight: number;
        lineHeight: string;
      };
      small: {
        fontSize: string;
        fontWeight: number;
        lineHeight: string;
      };
    };
    components: {
      button: {
        primary: {
          backgroundColor: string;
          color: string;
          padding: string;
          borderRadius: string;
          fontSize: string;
          fontWeight: number;
          '&:hover': {
            backgroundColor: string;
          };
        };
        secondary: {
          backgroundColor: string;
          color: string;
          padding: string;
          borderRadius: string;
          fontSize: string;
          fontWeight: number;
          '&:hover': {
            backgroundColor: string;
          };
        };
      };
      link: {
        color: string;
        textDecoration: string;
        '&:hover': {
          color: string;
        };
      };
    };
  }
} 