/**
 * Spacing tokens based on rem units with semantic naming
 * lg = 1rem (baseline = 16px default font size)
 * Scale goes up: xl, 2xl, 3xl, 4xl, 5xl, 6xl...
 * Scale goes down: md, sm, xs
 *
 * xs = 0.25rem (4px)
 * sm = 0.5rem (8px)
 * md = 0.75rem (12px)
 * lg = 1rem (16px) - BASELINE
 * xl = 1.5rem (24px)
 * 2xl = 2rem (32px)
 * 3xl = 3rem (48px)
 * 4xl = 4rem (64px)
 * 5xl = 5rem (80px)
 * 6xl = 6rem (96px)
 * 7xl = 7rem (112px)
 * 8xl = 8rem (128px)
 */

export type SpacingTokenSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "8xl";

export type SpacingToken = SpacingTokenSize | 0;

export const spacingTokens: Record<SpacingToken, string> = {
  0: "0rem",
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  "2xl": "2rem",
  "3xl": "3rem",
  "4xl": "4rem",
  "5xl": "5rem",
  "6xl": "6rem",
  "7xl": "7rem",
  "8xl": "8rem",
};

/**
 * Converts a spacing token to rem value
 * @param token - The spacing token (xs, sm, md, lg, xl, 2xl, 3xl, etc. or 0)
 * @returns The rem value as a string
 */
export const spacing = (token: SpacingToken): string => {
  return spacingTokens[token];
};

/**
 * Converts a spacing token or raw value to a CSS spacing value
 * Supports tokens (xs-sm-md-lg-xl-2xl-etc), numbers (converted to px), or strings (used as-is)
 * @param value - Token string, pixel number, or CSS string value
 * @returns CSS spacing value
 */
export const toSpacing = (value: SpacingToken | number | string): string => {
  // If it's the number 0, return 0rem
  if (value === 0 || value === "0") {
    return spacing(0);
  }

  // If it's a string that matches a valid token, use the token system
  if (typeof value === "string" && value in spacingTokens) {
    return spacing(value as SpacingToken);
  }

  // If it's a number, assume it's pixels
  if (typeof value === "number") {
    return `${value}px`;
  }

  // If it's already a string (not a token), return as-is
  return value;
};
