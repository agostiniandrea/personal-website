import React from "react";

import styled from "styled-components";

import { Text } from "@components/ions";

interface BadgeProps {
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
  as?: "span" | "li";
  /* Optional leading icon. Badges that carry one switch to a flex row so the
     glyph centres against the label instead of sitting on the baseline. */
  icon?: React.ReactNode;
}

interface StyledBadgeProps {
  $size: "sm" | "md";
  $hasIcon: boolean;
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
  user-select: none;

  ${({ $hasIcon }) =>
    $hasIcon
      ? `
    align-items: center;
    display: inline-flex;
    gap: 0.4rem;
  `
      : "display: inline-block;"}

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
  icon,
}) => {
  return (
    <StyledBadge
      $hasIcon={Boolean(icon)}
      $size={size}
      as={as}
      className={className}
    >
      {icon}
      {children}
    </StyledBadge>
  );
};

export default Badge;
