import React from "react";

import styled from "styled-components";

import { BREAKPOINTS } from "@constants";

interface HeadingProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "display" | "section" | "card";
  className?: string;
  id?: string;
}

interface StyledHeadingProps {
  $size: "display" | "section" | "card";
}

const StyledHeading = styled.h2<StyledHeadingProps>`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};

  ${({ $size, theme }) => {
    switch ($size) {
      case "display":
        return `
          font-size: ${theme.fontSizes["4xl"]};
          line-height: ${theme.lineHeights.tight};
          @media (min-width: ${BREAKPOINTS.tablet}) {
            font-size: ${theme.fontSizes["6xl"]};
          }
        `;
      case "card":
        return `
          font-size: ${theme.fontSizes.lg};
          line-height: ${theme.lineHeights.normal};
        `;
      case "section":
      default:
        return `
          font-size: ${theme.fontSizes["2xl"]};
          line-height: ${theme.lineHeights.snug};
          @media (min-width: ${BREAKPOINTS.xTablet}) {
            font-size: ${theme.fontSizes["3xl"]};
          }
          @media (min-width: ${BREAKPOINTS.tablet}) {
            font-size: ${theme.fontSizes["5xl"]};
          }
        `;
    }
  }}
`;

const Heading: React.FC<HeadingProps> = ({
  children,
  as = "h2",
  size = "section",
  className,
  id,
}) => {
  return (
    <StyledHeading $size={size} as={as} className={className} id={id}>
      {children}
    </StyledHeading>
  );
};

export default Heading;
