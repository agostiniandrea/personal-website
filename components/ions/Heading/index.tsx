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
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  margin: 0;

  ${({ $size }) => {
    switch ($size) {
      case "display":
        return `
          font-size: 3.25rem;
          line-height: 1;
        `;
      case "card":
        return `
          font-size: 1.25rem;
          line-height: 1.2;
        `;
      case "section":
      default:
        return `
          font-size: 2.5rem;
          line-height: 1.1;
        `;
    }
  }}

  ${({ $size }) =>
    $size === "display" &&
    `
    @media (min-width: ${BREAKPOINTS.tablet}) {
      font-size: 5rem;
    }
  `}

  ${({ $size }) =>
    $size === "section" &&
    `
    @media (min-width: ${BREAKPOINTS.tablet}) {
      font-size: 3.5rem;
    }
  `}
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
