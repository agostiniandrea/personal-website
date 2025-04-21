import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-controls'?: string;
  role?: string;
  id?: string;
  tabIndex?: number;
  description?: string;
}

const StyledButton = styled.button<ButtonProps>`
  background: ${({theme}) => theme.colors.button};
  color: ${({theme}) => theme.colors.button_text};
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: ${({theme}) => theme.radii.xs};
  cursor: ${({disabled}) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({disabled}) => (disabled ? 0.5 : 1)};
  transition: all 0.2s ease-in-out;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 500;

  &:hover {
    opacity: ${({disabled}) => (disabled ? 0.5 : 0.8)};
  }

  &:focus {
    outline: 2px solid ${({theme}) => theme.colors.button};
    outline-offset: 2px;
  }

  &:focus:not(:focus-visible) {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${({theme}) => theme.colors.button};
    outline-offset: 2px;
  }
`;

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  style,
  className,
  type = 'button',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  'aria-expanded': ariaExpanded,
  'aria-pressed': ariaPressed,
  'aria-controls': ariaControls,
  role,
  id,
  tabIndex,
  description,
}) => {
  // Generate unique ID for the button if not provided
  const buttonId = id || `button-${Math.random().toString(36).substr(2, 9)}`;
  // Generate ID for the description
  const descriptionId = `${buttonId}-description`;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  // If content is just text, use it as fallback for aria-label
  const defaultAriaLabel = typeof children === 'string' ? children : undefined;
  const computedAriaLabel = ariaLabel || defaultAriaLabel;

  return (
    <>
      <StyledButton
        onClick={onClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        style={style}
        className={className}
        type={type}
        aria-label={computedAriaLabel}
        aria-describedby={ariaDescribedby || (description ? descriptionId : undefined)}
        aria-expanded={ariaExpanded}
        aria-pressed={ariaPressed}
        aria-controls={ariaControls}
        aria-disabled={disabled}
        role={role}
        id={buttonId}
        tabIndex={tabIndex}
      >
        {children}
      </StyledButton>
      {description && (
        <span id={descriptionId} style={{ display: 'none' }}>
          {description}
        </span>
      )}
    </>
  );
};

export default Button; 