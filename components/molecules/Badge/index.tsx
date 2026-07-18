import React from "react";

import styled from "styled-components";

import { Text } from "@components/ions";

interface BadgeProps {
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
  as?: "span" | "li";
}

interface StyledBadgeProps {
  $size: "sm" | "md";
}

/* Passive tag: never suggest interactivity (no pointer cursor, no mobile
   tap flash) — these are labels, not buttons or filters */
const StyledBadge = styled(Text)<StyledBadgeProps>`
  -webkit-tap-highlight-color: transparent;
  background: ${({ theme }) => theme.colors.badgeBg};
  border: 1px solid ${({ theme }) => theme.colors.highlight};
  border-radius: ${({ theme }) => theme.radii.full};
  color: ${({ theme }) => theme.colors.paragraph};
  cursor: default;
  display: inline-block;
  user-select: none;

  ${({ $size, theme }) =>
    $size === "sm"
      ? `
    font-size: ${theme.fontSizes.xs};
    padding: ${theme.space.xs} ${theme.space.sm};
  `
      : `
    font-size: ${theme.fontSizes.sm};
    padding: ${theme.space.sm} ${theme.space.lg};
  `}
`;

const Badge: React.FC<BadgeProps> = ({
  children,
  size = "md",
  className,
  as = "span",
}) => {
  return (
    <StyledBadge $size={size} as={as} className={className}>
      {children}
    </StyledBadge>
  );
};

export default Badge;
