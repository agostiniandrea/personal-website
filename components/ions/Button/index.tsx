import React from "react";
import styled from "styled-components";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-expanded"?: boolean;
  "aria-pressed"?: boolean;
  "aria-controls"?: string;
  role?: string;
  id?: string;
  tabIndex?: number;
  description?: string;
}

const StyledButton = styled.button<ButtonProps>`
  background: ${({ theme }) => theme.colors.button};
  border: none;
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ theme }) => theme.colors.button_text};
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  line-height: ${({ theme }) => theme.lineHeights.base};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  padding: ${({ theme }) => theme.space.md} 1.25rem;
  transition: all 0.2s ease-in-out;

  @media (hover: hover) {
    &:hover {
      opacity: ${({ disabled }) => (disabled ? 0.5 : 0.8)};
    }
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.button};
    outline-offset: 2px;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.button};
    outline-offset: 2px;
  }
`;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  onClick,
  disabled = false,
  style,
  className,
  type = "button",
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
  "aria-expanded": ariaExpanded,
  "aria-pressed": ariaPressed,
  "aria-controls": ariaControls,
  role,
  id,
  tabIndex,
  description,
}, ref) => {
  const descriptionId = id ? `${id}-description` : undefined;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  // If content is just text, use it as fallback for aria-label
  const defaultAriaLabel = typeof children === "string" ? children : undefined;
  const computedAriaLabel = ariaLabel || defaultAriaLabel;

  return (
    <>
      <StyledButton
        ref={ref}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        style={style}
        className={className}
        type={type}
        aria-label={computedAriaLabel}
        aria-describedby={
          ariaDescribedby || (description ? descriptionId : undefined)
        }
        aria-expanded={ariaExpanded}
        aria-pressed={ariaPressed}
        aria-controls={ariaControls}
        aria-disabled={disabled}
        role={role}
        id={id}
        tabIndex={tabIndex}
      >
        {children}
      </StyledButton>
      {description && descriptionId && (
        <span id={descriptionId} className="sr-only">
          {description}
        </span>
      )}
    </>
  );
});

Button.displayName = "Button";

export default Button;
