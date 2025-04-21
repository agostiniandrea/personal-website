import React from 'react';
import styled from 'styled-components';

/**
 * Props for the Link component.
 */
interface LinkProps {
  /**
   * The content of the Link component.
   */
  children: React.ReactNode;

  /**
   * Additional styles for the Link component.
   */
  styles?: React.CSSProperties;

  /**
   * The href attribute for the Link component.
   */
  href: string;

  /**
   * Indicates whether the link is external.
   */
  isExternal?: boolean;

  /**
   * The aria-label attribute for the Link component.
   */
  ariaLabel?: string;
}

const StyledLink = styled.a<LinkProps>`
  color: ${({theme}) => theme.colors.primary};
  text-decoration: none;
  font-size: ${({theme}) => theme.fontSizes.md};
  font-family: ${({theme}) => theme.fontFamilies.body};
  line-height: ${({theme}) => theme.lineHeights.regular};
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${({theme}) => theme.colors.secondary};
  }

  &:focus {
    outline: 2px solid ${({theme}) => theme.colors.primary};
    outline-offset: 2px;
  }

  ${({ styles }) => styles}
`;

const Link: React.FC<LinkProps> = ({ 
  href, 
  styles, 
  children, 
  isExternal = false,
  ariaLabel 
}) => {
  const linkProps = {
    href,
    styles,
    tabIndex: 0,
    'aria-label': ariaLabel || (typeof children === 'string' ? children : undefined),
    ...(isExternal && {
      target: '_blank',
      rel: 'noopener noreferrer',
      'aria-label': `${ariaLabel || (typeof children === 'string' ? children : 'Link')} (opens in new tab)`
    })
  };

  return (
    <StyledLink {...linkProps}>
      {children}
    </StyledLink>
  );
};

export default Link;
