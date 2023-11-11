import {
  fontFamilies,
  fontSizes,
  fontSizesMobile,
  fontWeights,
  lineHeights,
} from './fonts'

export const typography = {
  /**
   * Bodies
   */
  // Body S
  bodyS: {
    fontFamily: fontFamilies.default,
    fontSize: fontSizesMobile.body, // 14px
    fontWeight: fontWeights.medium, // 500
    lineHeight: lineHeights.control,
    xTablet: {
      fontFamily: fontFamilies.default,
      fontSize: fontSizes.bodyS, // 14px
      fontWeight: fontWeights.medium, // 500
      lineHeight: lineHeights.control,
    },
  },
  // Body
  body: {
    fontFamily: fontFamilies.default,
    fontSize: fontSizesMobile.body, // 14px
    fontWeight: fontWeights.regular, // 400
    lineHeight: lineHeights.heading,
    xTablet: {
      fontFamily: fontFamilies.default,
      fontSize: fontSizes.body, // 18px
      fontWeight: fontWeights.regular, // 400
      letterSpacing: '-0.02em',
      lineHeight: lineHeights.control,
    },
  },
  // Body L
  bodyL: {
    fontFamily: fontFamilies.default,
    fontSize: fontSizesMobile.bodyL, // 18px
    fontWeight: fontWeights.regular, // 400
    lineHeight: lineHeights.heading,
    xTablet: {
      fontFamily: fontFamilies.default,
      fontSize: fontSizes.bodyL, // 21px
      fontWeight: fontWeights.regular, // 400
      letterSpacing: '-0.02em',
      lineHeight: lineHeights.heading,
    },
  },
  // Body XL
  font1: {
    fontFamily: fontFamilies.default,
    fontSize: fontSizesMobile.font1, // 18px
    fontWeight: fontWeights.regular, // 400
    lineHeight: lineHeights.heading,
    xTablet: {
      fontFamily: fontFamilies.default,
      fontSize: fontSizes.font1, // 24px
      fontWeight: fontWeights.regular, // 400
      letterSpacing: '-0.02em',
      lineHeight: lineHeights.heading,
    },
  },
  /**
   * Subheads
   */
  // SubHead S
  font2: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizesMobile.font2, // 28px
    fontWeight: fontWeights.regular, // 400
    lineHeight: lineHeights.regular,
    xTablet: {
      fontFamily: fontFamilies.heading,
      fontSize: fontSizes.font2, // 28px
      fontWeight: fontWeights.regular, // 400
      lineHeight: lineHeights.regular,
    },
  },
  // SubHead L
  font3: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizesMobile.font3, // 28px
    fontWeight: fontWeights.regular, // 400
    lineHeight: lineHeights.regular,
    xTablet: {
      fontFamily: fontFamilies.heading,
      fontSize: fontSizes.font3, // 36px
      fontWeight: fontWeights.regular, // 400
      lineHeight: lineHeights.regular,
    },
  },
  /**
   * Headlines
   */
  // Title L
  heading4: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizesMobile.heading4, // 28px
    fontWeight: fontWeights.semiBold, // 600
    lineHeight: lineHeights.regular,
    xTablet: {
      fontFamily: fontFamilies.heading,
      fontSize: fontSizes.heading4, // 30px
      lineHeight: lineHeights.regular,
      fontWeight: fontWeights.semiBold, // 600
    },
  },
  // H3
  heading3: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizesMobile.heading3, // 36px
    fontWeight: fontWeights.bold, // 700
    lineHeight: lineHeights.regular,
    xTablet: {
      fontFamily: fontFamilies.heading,
      fontSize: fontSizes.heading3, // 60px
      fontWeight: fontWeights.bold, // 700
      lineHeight: lineHeights.small,
    },
  },
  // H2
  heading2: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizesMobile.heading2, // 44px
    fontWeight: fontWeights.bold, // 700
    lineHeight: lineHeights.regular,
    xTablet: {
      fontFamily: fontFamilies.heading,
      fontSize: fontSizes.heading2, // 70px
      fontWeight: fontWeights.bold, // 700
      lineHeight: lineHeights.regular,
    },
  },
  // H2
  heading1: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizesMobile.heading1, // 60px
    fontWeight: fontWeights.bold, // 700
    lineHeight: lineHeights.regular,
    xTablet: {
      fontFamily: fontFamilies.heading,
      fontSize: fontSizes.heading1, // 80px
      fontWeight: fontWeights.bold, // 700
      lineHeight: lineHeights.regular,
    },
  },
}

export const typographyNames = {
  // Bodies
  bodyS: 'Body S / bodyS',
  body: 'Body M / body',
  bodyL: 'Body L / bodyL',
  font1: 'Body XL / font1',
  // Subheads
  font2: 'Subhead S / Title S / font2',
  font3: 'Subhead L / font3',

  // Headlines
  heading4: 'Title L / heading4',
  heading3: 'H3 / heading3',
  heading2: 'H2 / heading2',
  heading1: 'H1 / heading1',
}
