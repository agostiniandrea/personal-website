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

/* Theme tokens (see globalStyles), with the brand teal as the fallback. */
const INK = `var(--logo-ink, ${BRAND_TEAL})`;
const DISC = `var(--logo-disc, ${BRAND_TEAL})`;

const VIEWBOXES = {
  inline: INLINE_VIEWBOX,
  mark: MARK_VIEWBOX,
  symbol: SYMBOL_VIEWBOX,
} as const;

/* The disc and the lettering are the brand teal (lighter on the dark theme),
 * the symbol is white; the "symbol" variant is flipped: curves and leaf in
 * the lettering colour, nothing else. */
const BrandLogo: React.FC<BrandLogoProps> = ({
  label,
  variant = "inline",
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={VIEWBOXES[variant]}
    role="img"
    aria-label={label}
    focusable="false"
    className={className}
  >
    {variant === "symbol" ? (
      <path data-testid="brand-logo-symbol" fill={INK} d={MARK_PATH} />
    ) : (
      <>
        <circle cx="500" cy="500" r="500" fill={DISC} />
        <path fill="#FFFFFF" d={MARK_PATH} />
      </>
    )}
    {variant === "inline" && (
      <path
        data-testid="brand-logo-lettering"
        fill={INK}
        d={INLINE_TEXT_PATH}
      />
    )}
  </svg>
);

export default BrandLogo;
