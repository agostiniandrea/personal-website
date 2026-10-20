import React from "react";

import NextLink from "next/link";

import styled from "styled-components";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  isExternal?: boolean;
  /* Pass `false` to stop Next from adding the locale prefix, when the href
     already carries the right one. */
  locale?: string | false;
  ariaLabel?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLAnchorElement>;
  className?: string;
}

const StyledLink = styled(NextLink)`
  color: ${({ theme }) => theme.colors.highlight};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: ${({ theme }) => theme.lineHeights.tight};
  text-decoration: none;
  transition: color 0.2s ease-in-out;

  @media (hover: hover) {
    &:hover {
      color: ${({ theme }) => theme.colors.tertiary};
    }
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

const Link: React.FC<LinkProps> = ({
  href,
  children,
  style,
  isExternal = false,
  locale,
  ariaLabel,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
}) => (
  <StyledLink
    href={href}
    locale={locale}
    target={isExternal ? "_blank" : undefined}
    rel={isExternal ? "noopener noreferrer" : undefined}
    aria-label={ariaLabel}
    style={style}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={className}
  >
    {children}
  </StyledLink>
);

export default Link;
