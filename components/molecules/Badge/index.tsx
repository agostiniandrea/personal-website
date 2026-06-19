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

const StyledBadge = styled(Text)<StyledBadgeProps>`
  border: 1px solid ${({ theme }) => theme.colors.highlight};
  background: ${({ theme }) => theme.colors.badgeBg};
  color: ${({ theme }) => theme.colors.paragraph};
  border-radius: ${({ theme }) => theme.radii.full};
  display: inline-block;

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
