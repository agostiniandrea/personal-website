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
  border: 1px solid ${({ theme }) => theme.colors.main};
  color: ${({ theme }) => theme.colors.paragraph};
  border-radius: ${({ theme }) => theme.radii.full};
  display: inline-block;

  ${({ $size }) =>
    $size === "sm"
      ? `
    font-size: 0.75rem;
    padding: 0.25rem 0.625rem;
  `
      : `
    font-size: 0.875rem;
    padding: 0.375rem 0.875rem;
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
