import {
  BRAND_TEAL,
  INLINE_TEXT_PATH,
  INLINE_VIEWBOX,
  MARK_PATH,
  MARK_VIEWBOX,
} from "./paths";

export interface BrandLogoProps {
  /** Accessible name of the logo. */
  label: string;
  /** "inline" puts the name next to the symbol, on one line; "mark" is the symbol alone. */
  variant?: "inline" | "mark";
  className?: string;
}

/* The circle and the lettering are the brand teal, the symbol is white. */
const BrandLogo: React.FC<BrandLogoProps> = ({
  label,
  variant = "inline",
  className,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={variant === "mark" ? MARK_VIEWBOX : INLINE_VIEWBOX}
    role="img"
    aria-label={label}
    focusable="false"
    className={className}
  >
    <circle cx="500" cy="500" r="500" fill={BRAND_TEAL} />
    <path fill="#FFFFFF" d={MARK_PATH} />
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
