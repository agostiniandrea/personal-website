import React from 'react';
import styled from 'styled-components';

/**
 * Props for the Link component.
 */
interface LinkProps {
  /**
   * The URL that the hyperlink points to.
   */
  href: string;

  /**
   * The content of the link.
   */
  children: React.ReactNode;

  /**
   * Whether the link should open in a new tab.
   */
  isExternal?: boolean;

  /**
   * An accessible label for the link.
   */
  ariaLabel?: string;

  /**
   * Additional styles to apply to the link.
   */
  styles?: React.CSSProperties;
}

const StyledLink = styled.a.attrs<LinkProps>(({ styles }) => ({
  style: styles
}))<LinkProps>`
  color: ${({ theme }) => theme.colors.highlight};
  text-decoration: none;
  font-size: ${({theme}) => theme.fontSizes.md};
  font-family: ${({theme}) => theme.fontFamilies.body};
  line-height: ${({theme}) => theme.lineHeights.regular};
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.tertiary};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

const Link: React.FC<LinkProps> = ({ 
  href, 
  children, 
  styles,
  isExternal = false,
  ariaLabel 
}) => {
  const target = isExternal ? '_blank' : undefined;
  const rel = isExternal ? 'noopener noreferrer' : undefined;

  return (
    <StyledLink
      href={href}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      styles={styles}
      tabIndex={0}
    >
      {children}
    </StyledLink>
  );
};

export default Link;
