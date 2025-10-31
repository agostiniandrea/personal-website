import { BREAKPOINTS } from "@constants";
import styled from "styled-components";

type BoxSizeValue = string | { width: number; height: number };

// Array format: [default, mobile, tablet, desktop]
type ResponsiveBoxSize = BoxSizeValue[];

interface AspectRatioProps {
  children: React.ReactNode;
  boxSize?: BoxSizeValue | ResponsiveBoxSize;
  className?: string;
}

interface StyledAspectRatioProps {
  $boxSize?: BoxSizeValue | ResponsiveBoxSize;
}

const calculateAspectRatio = (value: BoxSizeValue): string => {
  if (typeof value === "string") {
    // Support format: "3840:2880" or "16:9" (using colon as separator)
    const parts = value.split(":");
    if (parts.length === 2) {
      const width = parseFloat(parts[0]);
      const height = parseFloat(parts[1]);
      if (!isNaN(width) && !isNaN(height) && height !== 0) {
        return `${(height / width) * 100}%`;
      }
    }
    return value;
  }
  // Object format: { width: 3840, height: 2880 }
  if (value.height !== 0) {
    return `${(value.height / value.width) * 100}%`;
  }
  return "100%";
};

// Breakpoint indices: [0: default, 1: mobile, 2: tablet, 3: desktop]
const getBoxSizeValue = (
  boxSize: BoxSizeValue | ResponsiveBoxSize | undefined,
  breakpointIndex: 0 | 1 | 2 | 3,
): string | null => {
  if (!boxSize) return null;

  // If it's a single value (string or object), return it for default only
  if (
    typeof boxSize === "string" ||
    (typeof boxSize === "object" && "width" in boxSize && "height" in boxSize)
  ) {
    return breakpointIndex === 0
      ? calculateAspectRatio(boxSize as BoxSizeValue)
      : null;
  }

  // If it's an array, get value at index or fallback to previous value
  if (Array.isArray(boxSize)) {
    // If breakpoint index is beyond array length, use last defined value
    if (breakpointIndex >= boxSize.length) {
      return boxSize.length > 0
        ? calculateAspectRatio(boxSize[boxSize.length - 1])
        : null;
    }

    // If value at index is undefined/null, fallback to previous value
    if (
      boxSize[breakpointIndex] === undefined ||
      boxSize[breakpointIndex] === null
    ) {
      // Look backwards for first defined value
      for (let i = breakpointIndex - 1; i >= 0; i--) {
        if (boxSize[i] !== undefined && boxSize[i] !== null) {
          return calculateAspectRatio(boxSize[i]);
        }
      }
      return null;
    }

    return calculateAspectRatio(boxSize[breakpointIndex]);
  }

  return null;
};

const StyledAspectRatio = styled.div<StyledAspectRatioProps>`
  position: relative;
  width: 100%;
  display: block;
  overflow: hidden;

  /* Default box size (index 0) */
  ${({ $boxSize }) => {
    const defaultRatio = getBoxSizeValue($boxSize, 0);
    if (defaultRatio) {
      return `
        padding-bottom: ${defaultRatio};
      `;
    }
    return "";
  }}

  /* Mobile (≥ 600px, index 1) */
  @media (min-width: ${BREAKPOINTS.mobile}) {
    ${({ $boxSize }) => {
      const mobileRatio = getBoxSizeValue($boxSize, 1);
      if (mobileRatio) {
        return `
          padding-bottom: ${mobileRatio};
        `;
      }
      return "";
    }}
  }

  /* Tablet (≥ 1200px, index 2) */
  @media (min-width: ${BREAKPOINTS.tablet}) {
    ${({ $boxSize }) => {
      const tabletRatio = getBoxSizeValue($boxSize, 2);
      if (tabletRatio) {
        return `
          padding-bottom: ${tabletRatio};
        `;
      }
      return "";
    }}
  }

  /* Desktop (≥ 1536px, index 3) */
  @media (min-width: ${BREAKPOINTS.desktop}) {
    ${({ $boxSize }) => {
      const desktopRatio = getBoxSizeValue($boxSize, 3);
      if (desktopRatio) {
        return `
          padding-bottom: ${desktopRatio};
        `;
      }
      return "";
    }}
  }

  > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;

const AspectRatio: React.FC<AspectRatioProps> = ({
  children,
  boxSize = "16:9",
  className,
}) => {
  return (
    <StyledAspectRatio $boxSize={boxSize} className={className}>
      {children}
    </StyledAspectRatio>
  );
};

export default AspectRatio;

