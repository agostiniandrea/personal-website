import { BREAKPOINTS } from "@constants";
import styled, { Interpolation } from "styled-components";

type FullBleedValue = boolean | boolean[];
type ContainerElement = "div" | "section" | "header" | "footer" | "main" | "article" | "aside" | "nav";

interface ContainerProps {
  as?: ContainerElement;
  children: React.ReactNode;
  verticalPadding?: boolean;
  fullBleed?: FullBleedValue;
  styles?: Interpolation<React.CSSProperties>;
}

interface StyledContainerProps {
  $verticalPadding?: boolean;
  $fullBleed?: FullBleedValue;
  $styles?: Interpolation<React.CSSProperties>;
}

// Helper to get full bleed value at specific breakpoint index
// [0: default, 1: mobile, 2: tablet, 3: desktop]
const getFullBleed = (
  fullBleed: FullBleedValue | undefined,
  breakpointIndex: 0 | 1 | 2 | 3,
): boolean => {
  if (!fullBleed) return false;

  // If it's a single boolean, return it for all breakpoints
  if (typeof fullBleed === "boolean") {
    return fullBleed;
  }

  // If it's an array, get value at index or fallback to previous value
  if (Array.isArray(fullBleed)) {
    // If breakpoint index is beyond array length, use last defined value
    if (breakpointIndex >= fullBleed.length) {
      return fullBleed.length > 0 ? fullBleed[fullBleed.length - 1] : false;
    }

    // If value at index is undefined/null, fallback to previous value
    if (fullBleed[breakpointIndex] === undefined || fullBleed[breakpointIndex] === null) {
      // Look backwards for first defined value
      for (let i = breakpointIndex - 1; i >= 0; i--) {
        if (fullBleed[i] !== undefined && fullBleed[i] !== null) {
          return fullBleed[i];
        }
      }
      return false;
    }

    return fullBleed[breakpointIndex];
  }

  return false;
};

const StyledContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith("$"),
})<StyledContainerProps>`
  display: grid;
  position: relative;
  min-height: auto;
  width: 100%;

  /* Default values (index 0) */
  ${({ $fullBleed }) => {
    const isFullBleed = getFullBleed($fullBleed, 0);

    if (isFullBleed) {
      return `
        grid-template-columns: 1fr;
        column-gap: 0;
      `;
    }

    return `
      grid-template-columns: 1fr min(1440px, 100% - 48px) 1fr;
      column-gap: calc(24px);
    `;
  }}

  ${(props) =>
    props.$verticalPadding &&
    "padding-top: calc(1.5rem); padding-bottom: calc(1.5rem);"}

  /* Mobile (≥ 600px, index 1) */
  @media (min-width: ${BREAKPOINTS.mobile}) {
    ${({ $fullBleed }) => {
      const isFullBleed = getFullBleed($fullBleed, 1);

      if (isFullBleed) {
        return `
          grid-template-columns: 1fr;
          column-gap: 0;
        `;
      }

      return `
        grid-template-columns: 1fr min(1440px, 100% - 48px) 1fr;
        column-gap: calc(24px);
      `;
    }}
  }

  /* Tablet (≥ 900px) */
  @media (min-width: ${BREAKPOINTS.xTablet}) {
    ${({ $fullBleed }) => {
      const isFullBleed = getFullBleed($fullBleed, 1); // Still mobile index for 900px

      if (!isFullBleed) {
        return `
          grid-template-columns: 1fr min(1440px, 100% - 72px) 1fr;
          column-gap: calc(36px);
        `;
      }
      return "";
    }}
  }

  /* Tablet (≥ 1200px, index 2) */
  @media (min-width: ${BREAKPOINTS.tablet}) {
    ${({ $fullBleed, $verticalPadding }) => {
      const isFullBleed = getFullBleed($fullBleed, 2);

      if (isFullBleed) {
        return `
          grid-template-columns: 1fr;
          column-gap: 0;
        `;
      }

      return `
        grid-template-columns: 1fr min(1440px, 100% - 162px) 1fr;
        column-gap: calc(81px);
        ${$verticalPadding &&
        "padding-top: calc(2.5rem); padding-bottom: calc(2.5rem);"}
      `;
    }}
  }

  /* Desktop (≥ 1536px, index 3) */
  @media (min-width: ${BREAKPOINTS.desktop}) {
    ${({ $fullBleed }) => {
      const isFullBleed = getFullBleed($fullBleed, 3);

      if (isFullBleed) {
        return `
          grid-template-columns: 1fr;
          column-gap: 0;
        `;
      }

      return `
        grid-template-columns: 1fr min(1440px, 100% - 243px) 1fr;
        column-gap: calc(121.5px);
      `;
    }}
  }

  > * {
    ${({ $fullBleed }) => {
      const isFullBleed = getFullBleed($fullBleed, 0);
      if (isFullBleed) {
        return `grid-column: 1 / -1;`;
      }
      return `grid-column: 2 / auto;`;
    }}

    @media (min-width: ${BREAKPOINTS.mobile}) {
      ${({ $fullBleed }) => {
        const isFullBleed = getFullBleed($fullBleed, 1);
        if (isFullBleed) {
          return `grid-column: 1 / -1;`;
        }
        return `grid-column: 2 / auto;`;
      }}
    }

    @media (min-width: ${BREAKPOINTS.tablet}) {
      ${({ $fullBleed }) => {
        const isFullBleed = getFullBleed($fullBleed, 2);
        if (isFullBleed) {
          return `grid-column: 1 / -1;`;
        }
        return `grid-column: 2 / auto;`;
      }}
    }

    @media (min-width: ${BREAKPOINTS.desktop}) {
      ${({ $fullBleed }) => {
        const isFullBleed = getFullBleed($fullBleed, 3);
        if (isFullBleed) {
          return `grid-column: 1 / -1;`;
        }
        return `grid-column: 2 / auto;`;
      }}
    }
  }

  ${({ $styles }) => $styles}
`;

const Container: React.FC<ContainerProps> = ({
  as = "section",
  children,
  verticalPadding,
  fullBleed,
  styles,
}) => (
  <StyledContainer
    as={as}
    $verticalPadding={verticalPadding}
    $fullBleed={fullBleed}
    $styles={styles}
  >
    {children}
  </StyledContainer>
);

export default Container;
