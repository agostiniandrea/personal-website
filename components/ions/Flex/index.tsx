import styled, { Interpolation } from "styled-components";

import { type SpacingToken, toSpacing } from "@config/tokens";
import { BREAKPOINTS } from "@constants";

type FlexDirectionValue = "row" | "column" | "row-reverse" | "column-reverse";
// Gap can be a spacing token (xs, sm, md, lg, xl, 2xl, etc.), number (pixels), or string (any CSS value)
type GapValue = SpacingToken | number | string;

// Array format: [default, mobile, tablet, desktop, xl]
type ResponsiveArray<T> = T[];
// Still support single value for backward compatibility
type ResponsiveValue<T> = T | ResponsiveArray<T>;

interface FlexProps {
  children: React.ReactNode;
  direction?: ResponsiveValue<FlexDirectionValue>;
  gap?: ResponsiveValue<GapValue>;
  alignItems?: ResponsiveValue<React.CSSProperties["alignItems"]>;
  justifyContent?: ResponsiveValue<React.CSSProperties["justifyContent"]>;
  wrap?: ResponsiveValue<React.CSSProperties["flexWrap"]>;
  className?: string;
  styles?: Interpolation<React.CSSProperties>;
}

interface StyledFlexProps {
  $direction?: ResponsiveValue<FlexDirectionValue>;
  $gap?: ResponsiveValue<GapValue>;
  $alignItems?: ResponsiveValue<React.CSSProperties["alignItems"]>;
  $justifyContent?: ResponsiveValue<React.CSSProperties["justifyContent"]>;
  $wrap?: ResponsiveValue<React.CSSProperties["flexWrap"]>;
  $styles?: Interpolation<React.CSSProperties>;
}

// Breakpoint indices: [0: default, 1: mobile, 2: tablet, 3: desktop, 4: xl]
const getResponsiveValue = <T,>(
  value: ResponsiveValue<T> | undefined,
  breakpointIndex: 0 | 1 | 2 | 3 | 4,
): T | undefined => {
  if (!value) return undefined;

  // If it's a single value (not an array), return it for default only
  if (!Array.isArray(value)) {
    return breakpointIndex === 0 ? (value as T) : undefined;
  }

  // If it's an array, get value at index or fallback to previous value
  const array = value as T[];

  // If breakpoint index is beyond array length, use last defined value
  if (breakpointIndex >= array.length) {
    // Use the last defined value if array has values
    return array.length > 0 ? array[array.length - 1] : undefined;
  }

  // If value at index is undefined/null, fallback to previous value
  if (array[breakpointIndex] === undefined || array[breakpointIndex] === null) {
    // Look backwards for first defined value
    for (let i = breakpointIndex - 1; i >= 0; i--) {
      if (array[i] !== undefined && array[i] !== null) {
        return array[i];
      }
    }
    return undefined;
  }

  return array[breakpointIndex];
};

const formatGap = (gap: GapValue | undefined): string | undefined => {
  if (gap === undefined || gap === null) return undefined;
  return toSpacing(gap);
};

const StyledFlex = styled.div<StyledFlexProps>`
  display: flex;

  /* Default values (index 0) */
  ${({ $direction, $gap, $alignItems, $justifyContent, $wrap }) => {
    const defaultDirection = getResponsiveValue($direction, 0);
    const defaultGap = formatGap(getResponsiveValue($gap, 0));
    const defaultAlignItems = getResponsiveValue($alignItems, 0);
    const defaultJustifyContent = getResponsiveValue($justifyContent, 0);
    const defaultWrap = getResponsiveValue($wrap, 0);

    return `
      ${defaultDirection ? `flex-direction: ${defaultDirection};` : ""}
      ${defaultGap ? `gap: ${defaultGap};` : ""}
      ${defaultAlignItems ? `align-items: ${defaultAlignItems};` : ""}
      ${defaultJustifyContent ? `justify-content: ${defaultJustifyContent};` : ""}
      ${defaultWrap ? `flex-wrap: ${defaultWrap};` : ""}
    `;
  }}

  /* Mobile (≥ 600px, index 1) */
  @media (min-width: ${BREAKPOINTS.mobile}) {
    ${({ $direction, $gap, $alignItems, $justifyContent, $wrap }) => {
      const mobileDirection = getResponsiveValue($direction, 1);
      const mobileGap = formatGap(getResponsiveValue($gap, 1));
      const mobileAlignItems = getResponsiveValue($alignItems, 1);
      const mobileJustifyContent = getResponsiveValue($justifyContent, 1);
      const mobileWrap = getResponsiveValue($wrap, 1);

      if (
        !mobileDirection &&
        !mobileGap &&
        !mobileAlignItems &&
        !mobileJustifyContent &&
        !mobileWrap
      ) {
        return "";
      }

      return `
        ${mobileDirection ? `flex-direction: ${mobileDirection};` : ""}
        ${mobileGap ? `gap: ${mobileGap};` : ""}
        ${mobileAlignItems ? `align-items: ${mobileAlignItems};` : ""}
        ${mobileJustifyContent ? `justify-content: ${mobileJustifyContent};` : ""}
        ${mobileWrap ? `flex-wrap: ${mobileWrap};` : ""}
      `;
    }}
  }

  /* Tablet (≥ 1200px, index 2) */
  @media (min-width: ${BREAKPOINTS.tablet}) {
    ${({ $direction, $gap, $alignItems, $justifyContent, $wrap }) => {
      const tabletDirection = getResponsiveValue($direction, 2);
      const tabletGap = formatGap(getResponsiveValue($gap, 2));
      const tabletAlignItems = getResponsiveValue($alignItems, 2);
      const tabletJustifyContent = getResponsiveValue($justifyContent, 2);
      const tabletWrap = getResponsiveValue($wrap, 2);

      if (
        !tabletDirection &&
        !tabletGap &&
        !tabletAlignItems &&
        !tabletJustifyContent &&
        !tabletWrap
      ) {
        return "";
      }

      return `
        ${tabletDirection ? `flex-direction: ${tabletDirection};` : ""}
        ${tabletGap ? `gap: ${tabletGap};` : ""}
        ${tabletAlignItems ? `align-items: ${tabletAlignItems};` : ""}
        ${tabletJustifyContent ? `justify-content: ${tabletJustifyContent};` : ""}
        ${tabletWrap ? `flex-wrap: ${tabletWrap};` : ""}
      `;
    }}
  }

  /* Desktop (≥ 1536px, index 3) */
  @media (min-width: ${BREAKPOINTS.desktop}) {
    ${({ $direction, $gap, $alignItems, $justifyContent, $wrap }) => {
      const desktopDirection = getResponsiveValue($direction, 3);
      const desktopGap = formatGap(getResponsiveValue($gap, 3));
      const desktopAlignItems = getResponsiveValue($alignItems, 3);
      const desktopJustifyContent = getResponsiveValue($justifyContent, 3);
      const desktopWrap = getResponsiveValue($wrap, 3);

      if (
        !desktopDirection &&
        !desktopGap &&
        !desktopAlignItems &&
        !desktopJustifyContent &&
        !desktopWrap
      ) {
        return "";
      }

      return `
        ${desktopDirection ? `flex-direction: ${desktopDirection};` : ""}
        ${desktopGap ? `gap: ${desktopGap};` : ""}
        ${desktopAlignItems ? `align-items: ${desktopAlignItems};` : ""}
        ${desktopJustifyContent ? `justify-content: ${desktopJustifyContent};` : ""}
        ${desktopWrap ? `flex-wrap: ${desktopWrap};` : ""}
      `;
    }}
  }

  ${({ $styles }) => $styles}
`;

const Flex: React.FC<FlexProps> = ({
  children,
  direction,
  gap,
  alignItems,
  justifyContent,
  wrap,
  className,
  styles,
}) => {
  return (
    <StyledFlex
      $direction={direction}
      $gap={gap}
      $alignItems={alignItems}
      $justifyContent={justifyContent}
      $wrap={wrap}
      className={className}
      $styles={styles}
    >
      {children}
    </StyledFlex>
  );
};

export default Flex;
