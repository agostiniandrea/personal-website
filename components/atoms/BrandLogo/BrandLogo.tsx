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

/* The circle and the lettering are the brand teal, the symbol is white;
 * the "symbol" variant is flipped: teal curves and leaf, nothing else. */
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
      <path data-testid="brand-logo-symbol" fill={BRAND_TEAL} d={MARK_PATH} />
    ) : (
      <>
        <circle cx="500" cy="500" r="500" fill={BRAND_TEAL} />
        <path fill="#FFFFFF" d={MARK_PATH} />
      </>
    )}
    {variant === "inline" && (
      <path
        data-testid="brand-logo-lettering"
        fill={BRAND_TEAL}
        d={INLINE_TEXT_PATH}
      />
    )}
  </svg>
);

export default BrandLogo;
