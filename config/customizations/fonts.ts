export const fontFamilies: Record<"default" | "heading", string> = {
  default: "var(--font-inter), sans-serif",
  heading: "var(--font-space-grotesk), sans-serif",
};

export const fontSizes = {
  xs: "0.75rem", // 12px — labels, section labels, badge sm
  sm: "0.875rem", // 14px — small text, badges, descriptions
  md: "1rem", // 16px — base body, buttons, nav links
  lg: "1.25rem", // 20px — card headings (h3), logo, nav
  xl: "1.5rem", // 24px — role mobile, locale button context
  "2xl": "2rem", // 32px — hero role desktop
  "3xl": "2.5rem", // 40px — section h2 mobile (Heading section)
  "4xl": "3.25rem", // 52px — hero h1 mobile (Heading display)
  "5xl": "3.5rem", // 56px — section h2 desktop
  "6xl": "5rem", // 80px — hero h1 desktop
};

export const fontWeights = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
};

export const lineHeights = {
  tight: 1, // section labels
  snug: 1.1, // section headings (h2)
  normal: 1.2, // card headings, compact
  base: 1.5, // base body text
  relaxed: 1.6, // description paragraphs
  loose: 1.7, // spacious body text
};

// Keep these for backward compat with typography.ts presets — do not use in components
export const fontSizesMobile = {
  heading1: "3.6428rem",
  heading2: "2.7142rem",
  heading3: "2rem",
  heading4: "2rem",
  bodyS: "1rem",
  body: "14px",
  bodyL: "1rem",
  font1: "1.5rem",
  font2: "1.5rem",
  font3: "2rem",
};
