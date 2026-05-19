import {
  fontFamilies,
  fontSizes,
  fontSizesMobile,
  fontWeights,
  lineHeights,
} from "./fonts";

// Typography presets for Storybook / design reference only — do not use in components
export const typography = {
  /**
   * Bodies
   */
  // Body S
  bodyS: {
    fontFamily: fontFamilies.default,
    fontSize: fontSizesMobile.body, // 14px
    fontWeight: fontWeights.medium, // 500
    lineHeight: lineHeights.base,
    xTablet: {
      fontFamily: fontFamilies.default,
      fontSize: fontSizes.sm, // 14px
      fontWeight: fontWeights.medium, // 500
      lineHeight: lineHeights.base,
    },
  },
  // Body
  body: {
    fontFamily: fontFamilies.default,
    fontSize: fontSizesMobile.body, // 14px
    fontWeight: fontWeights.regular, // 400
    lineHeight: lineHeights.relaxed,
    xTablet: {
      fontFamily: fontFamilies.default,
      fontSize: fontSizes.md, // 16px
      fontWeight: fontWeights.regular, // 400
      letterSpacing: "-0.02em",
      lineHeight: lineHeights.base,
    },
  },
  // Body L
  bodyL: {
    fontFamily: fontFamilies.default,
    fontSize: fontSizesMobile.bodyL, // 18px (mobile)
    fontWeight: fontWeights.regular, // 400
    lineHeight: lineHeights.relaxed,
    xTablet: {
      fontFamily: fontFamilies.default,
      fontSize: fontSizes.lg, // 20px
      fontWeight: fontWeights.regular, // 400
      letterSpacing: "-0.02em",
      lineHeight: lineHeights.relaxed,
    },
  },
  // Body XL
  font1: {
    fontFamily: fontFamilies.default,
    fontSize: fontSizesMobile.font1, // 24px (mobile)
    fontWeight: fontWeights.regular, // 400
    lineHeight: lineHeights.relaxed,
    xTablet: {
      fontFamily: fontFamilies.default,
      fontSize: fontSizes.xl, // 24px
      fontWeight: fontWeights.regular, // 400
      letterSpacing: "-0.02em",
      lineHeight: lineHeights.relaxed,
    },
  },
  /**
   * Subheads
   */
  // SubHead S
  font2: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizesMobile.font2, // 24px (mobile)
    fontWeight: fontWeights.regular, // 400
    lineHeight: lineHeights.tight,
    xTablet: {
      fontFamily: fontFamilies.heading,
      fontSize: fontSizes["2xl"], // 32px
      fontWeight: fontWeights.regular, // 400
      lineHeight: lineHeights.tight,
    },
  },
  // SubHead L
  font3: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizesMobile.font3, // 32px (mobile)
    fontWeight: fontWeights.regular, // 400
    lineHeight: lineHeights.tight,
    xTablet: {
      fontFamily: fontFamilies.heading,
      fontSize: fontSizes["3xl"], // 40px
      fontWeight: fontWeights.regular, // 400
      lineHeight: lineHeights.tight,
    },
  },
  /**
   * Headlines
   */
  // Title L
  heading4: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizesMobile.heading4, // 32px (mobile)
    fontWeight: fontWeights.semiBold, // 600
    lineHeight: lineHeights.tight,
    xTablet: {
      fontFamily: fontFamilies.heading,
      fontSize: fontSizes["3xl"], // 40px
      lineHeight: lineHeights.tight,
      fontWeight: fontWeights.semiBold, // 600
    },
  },
  // H3
  heading3: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizesMobile.heading3, // 32px (mobile)
    fontWeight: fontWeights.bold, // 700
    lineHeight: lineHeights.tight,
    xTablet: {
      fontFamily: fontFamilies.heading,
      fontSize: fontSizes["5xl"], // 56px
      fontWeight: fontWeights.bold, // 700
      lineHeight: lineHeights.snug,
    },
  },
  // H2
  heading2: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizesMobile.heading2, // ~43px (mobile)
    fontWeight: fontWeights.bold, // 700
    lineHeight: lineHeights.tight,
    xTablet: {
      fontFamily: fontFamilies.heading,
      fontSize: fontSizes["6xl"], // 80px (approx)
      fontWeight: fontWeights.bold, // 700
      lineHeight: lineHeights.tight,
    },
  },
  // H1
  heading1: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizesMobile.heading1, // ~58px (mobile)
    fontWeight: fontWeights.bold, // 700
    lineHeight: lineHeights.tight,
    xTablet: {
      fontFamily: fontFamilies.heading,
      fontSize: fontSizes["6xl"], // 80px
      fontWeight: fontWeights.bold, // 700
      lineHeight: lineHeights.tight,
    },
  },
};

export const typographyNames = {
  // Bodies
  bodyS: "Body S / bodyS",
  body: "Body M / body",
  bodyL: "Body L / bodyL",
  font1: "Body XL / font1",
  // Subheads
  font2: "Subhead S / Title S / font2",
  font3: "Subhead L / font3",

  // Headlines
  heading4: "Title L / heading4",
  heading3: "H3 / heading3",
  heading2: "H2 / heading2",
  heading1: "H1 / heading1",
};
