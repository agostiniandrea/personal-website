import React from "react";
import styled from "styled-components";

interface TextProps {
  children: React.ReactNode;
  variant?: "small" | "regular" | "large";
  style?: React.CSSProperties;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
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
        return "0.875rem";
      case "large":
        return "1.25rem";
      default:
        return "1rem";
    }
  }};
  line-height: 1.5;
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
