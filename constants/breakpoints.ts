export type Breakpoints = {
  xMobile: string;
  mobile: string;
  xTablet: string;
  tablet: string;
  desktop: string;
};

const breakpoints: Breakpoints = {
  xMobile: "0px",
  mobile: "600px",
  xTablet: "900px",
  tablet: "1200px",
  desktop: "1536px",
};

/**
 * Max-width counterparts, for styles that target everything *below* a
 * breakpoint. Offset by 0.02px so they never overlap their min-width twin at
 * fractional viewport widths (zoom, browser scaling).
 *
 * Always pair these with `breakpoints` — never hardcode a raw pixel value.
 */
export const breakpointsBelow: Omit<Breakpoints, "xMobile"> = {
  mobile: "599.99px",
  xTablet: "899.99px",
  tablet: "1199.99px",
  desktop: "1535.99px",
};

export default breakpoints;
