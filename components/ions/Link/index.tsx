import React from "react";
import NextLink from "next/link";
import styled from "styled-components";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  isExternal?: boolean;
  ariaLabel?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLAnchorElement>;
  className?: string;
}

const StyledLink = styled(NextLink)`
  color: ${({ theme }) => theme.colors.highlight};
  text-decoration: none;
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: ${({ theme }) => theme.lineHeights.tight};
  transition: color 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.tertiary};
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
  ariaLabel,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className,
}) => (
  <StyledLink
    href={href}
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
