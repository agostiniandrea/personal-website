import { useId } from "react";

import {
  BRAND_TEAL,
  INLINE_TEXT_PATH,
  INLINE_VIEWBOX,
  MARK_PATH,
  MARK_VIEWBOX,
  SYMBOL_VIEWBOX,
} from "./paths";

export interface BrandLogoProps {
  /** Accessible name of the logo. */
  label: string;
  /**
   * "inline" puts the name next to the symbol, on one line; "mark" is the
   * symbol in its circle; "symbol" is the curves and the leaf alone, teal, no circle.
   */
  variant?: "inline" | "mark" | "symbol";
  className?: string;
}

const VIEWBOXES = {
  inline: INLINE_VIEWBOX,
  mark: MARK_VIEWBOX,
  symbol: SYMBOL_VIEWBOX,
} as const;

/* Light bottom-left to bright top-right: the "shine" on the ink. Both ends come
 * from the theme (see globalStyles) and fall back to the light-theme pair; the
 * mid-tones stay close to the brand teal so the logo reads as one colour. */
const SHINE_FROM = `var(--logo-shine-from, #2A7F78)`;
const SHINE_TO = `var(--logo-shine-to, #379A90)`;

/* The disc is the brand teal and the symbol is white; the lettering and the
 * "symbol" variant (curves and leaf alone, no disc) are the shiny ink. */
const BrandLogo: React.FC<BrandLogoProps> = ({
  label,
  variant = "inline",
  className,
}) => {
  const gradientId = `logo-shine-${useId().replace(/\W/g, "")}`;
  const ink = `url(#${gradientId})`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={VIEWBOXES[variant]}
      role="img"
      aria-label={label}
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: SHINE_FROM }} />
          <stop offset="1" style={{ stopColor: SHINE_TO }} />
        </linearGradient>
      </defs>
      {variant === "symbol" ? (
        <path data-testid="brand-logo-symbol" fill={ink} d={MARK_PATH} />
      ) : (
        <>
          <circle cx="500" cy="500" r="500" fill={BRAND_TEAL} />
          <path fill="#FFFFFF" d={MARK_PATH} />
        </>
      )}
      {variant === "inline" && (
        <path
          data-testid="brand-logo-lettering"
          fill={ink}
          d={INLINE_TEXT_PATH}
        />
      )}
    </svg>
  );
};

export default BrandLogo;
