import React from "react";

import styled from "styled-components";

import { type SpacingToken,toSpacing } from "@config/tokens";
import { BREAKPOINTS } from "@constants";

type ColumnValue = number | string; // number → repeat(N, 1fr); string → literal CSS
type ResponsiveColumns = ColumnValue | (ColumnValue | undefined)[];
type GapValue = SpacingToken | number | string;

interface GridProps {
  children: React.ReactNode;
  columns?: ResponsiveColumns;
  gap?: GapValue;
  className?: string;
  as?: "div" | "section" | "ul" | "ol";
}

interface StyledGridProps {
  $columns?: ResponsiveColumns;
  $gap?: GapValue;
}

// Breakpoint indices: [0: default, 1: mobile(600px), 2: xTablet(900px), 3: tablet(1200px), 4: desktop(1536px)]
const getResponsiveColumnValue = (
  value: ResponsiveColumns | undefined,
  breakpointIndex: 0 | 1 | 2 | 3 | 4,
): ColumnValue | undefined => {
  if (value === undefined || value === null) return undefined;

  if (!Array.isArray(value)) {
    return breakpointIndex === 0 ? value : undefined;
  }

  const array = value as (ColumnValue | undefined)[];

  if (breakpointIndex >= array.length) {
    return array.length > 0 ? array[array.length - 1] : undefined;
  }

  if (array[breakpointIndex] === undefined || array[breakpointIndex] === null) {
    for (let i = breakpointIndex - 1; i >= 0; i--) {
      if (array[i] !== undefined && array[i] !== null) {
        return array[i];
      }
    }
    return undefined;
  }

  return array[breakpointIndex];
};

const formatColumns = (value: ColumnValue | undefined): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "number") return `repeat(${value}, 1fr)`;
  return value;
};

const StyledGrid = styled.div<StyledGridProps>`
  display: grid;

  ${({ $columns, $gap }) => {
    const cols = formatColumns(getResponsiveColumnValue($columns, 0));
    const gap = $gap !== undefined ? toSpacing($gap as SpacingToken | number | string) : undefined;
    return `
      ${cols ? `grid-template-columns: ${cols};` : ""}
      ${gap ? `gap: ${gap};` : ""}
    `;
  }}

  @media (min-width: ${BREAKPOINTS.mobile}) {
    ${({ $columns }) => {
      const cols = formatColumns(getResponsiveColumnValue($columns, 1));
      if (!cols) return "";
      return `grid-template-columns: ${cols};`;
    }}
  }

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    ${({ $columns }) => {
      const cols = formatColumns(getResponsiveColumnValue($columns, 2));
      if (!cols) return "";
      return `grid-template-columns: ${cols};`;
    }}
  }

  @media (min-width: ${BREAKPOINTS.tablet}) {
    ${({ $columns }) => {
      const cols = formatColumns(getResponsiveColumnValue($columns, 3));
      if (!cols) return "";
      return `grid-template-columns: ${cols};`;
    }}
  }

  @media (min-width: ${BREAKPOINTS.desktop}) {
    ${({ $columns }) => {
      const cols = formatColumns(getResponsiveColumnValue($columns, 4));
      if (!cols) return "";
      return `grid-template-columns: ${cols};`;
    }}
  }
`;

const Grid: React.FC<GridProps> = ({
  children,
  columns,
  gap,
  className,
  as = "div",
}) => {
  return (
    <StyledGrid $columns={columns} $gap={gap} className={className} as={as}>
      {children}
    </StyledGrid>
  );
};

export default Grid;
