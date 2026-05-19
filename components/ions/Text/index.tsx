import React from "react";
import styled from "styled-components";

interface TextProps {
  children: React.ReactNode;
  variant?: "small" | "regular" | "large";
  style?: React.CSSProperties;
  className?: string;
  as?: 'span' | 'p' | 'div'
  id?: string;
  role?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}

const StyledText = styled.p<TextProps>`
  color: ${(props) => props.theme.colors.paragraph};
  font-size: ${(props) => {
    switch (props.variant) {
      case "small":
        return props.theme.fontSizes.sm;
      case "large":
        return props.theme.fontSizes.lg;
      default:
        return props.theme.fontSizes.md;
    }
  }};
  line-height: ${(props) => props.theme.lineHeights.base};
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
      variant={variant}
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
