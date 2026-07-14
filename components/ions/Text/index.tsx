import React from "react";

import styled from "styled-components";

type TextVariant = "small" | "regular" | "large";

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  style?: React.CSSProperties;
  className?: string;
  as?: "span" | "p" | "div";
  id?: string;
  role?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

interface StyledTextProps {
  $variant: TextVariant;
}

const StyledText = styled.p.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith("$"),
})<StyledTextProps>`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ $variant, theme }) => {
    switch ($variant) {
      case "small":
        return theme.fontSizes.sm;
      case "large":
        return theme.fontSizes.lg;
      default:
        return theme.fontSizes.md;
    }
  }};
  line-height: ${({ theme }) => theme.lineHeights.base};
  margin: 0;
  padding: 0;
`;

const Text: React.FC<TextProps> = ({
  children,
  variant = "regular",
  style,
  className,
  as = "p",
  id,
  role,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
}) => {
  return (
    <StyledText
      $variant={variant}
      style={style}
      className={className}
      as={as}
      id={id}
      role={role}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedby}
    >
      {children}
    </StyledText>
  );
};

export default Text;
