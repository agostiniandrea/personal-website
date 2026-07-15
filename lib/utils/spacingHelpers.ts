import { type SpacingToken,toSpacing } from "@config/tokens";

/**
 * Type for spacing values that can be used in CSS properties
 * Supports: spacing tokens (xs, sm, md, lg, xl, 2xl, etc.), numbers (px), or strings (any CSS value)
 */
export type SpacingValue = SpacingToken | number | string;

/**
 * Utility function to convert spacing value to CSS string
 * This can be used in styled-components or inline styles
 */
export const spacing = (value: SpacingValue): string => {
  return toSpacing(value);
};

/**
 * Helper function for margin CSS property
 */
export const margin = (value: SpacingValue): string => `margin: ${spacing(value)};`;

/**
 * Helper function for padding CSS property
 */
export const padding = (value: SpacingValue): string => `padding: ${spacing(value)};`;

/**
 * Helper function for gap CSS property
 */
export const gap = (value: SpacingValue): string => `gap: ${spacing(value)};`;

/**
 * Helper function for row-gap CSS property
 */
export const rowGap = (value: SpacingValue): string => `row-gap: ${spacing(value)};`;

/**
 * Helper function for column-gap CSS property
 */
export const columnGap = (value: SpacingValue): string => `column-gap: ${spacing(value)};`;

/**
 * Helper function for margin-top CSS property
 */
export const marginTop = (value: SpacingValue): string =>
  `margin-top: ${spacing(value)};`;

/**
 * Helper function for margin-right CSS property
 */
export const marginRight = (value: SpacingValue): string =>
  `margin-right: ${spacing(value)};`;

/**
 * Helper function for margin-bottom CSS property
 */
export const marginBottom = (value: SpacingValue): string =>
  `margin-bottom: ${spacing(value)};`;

/**
 * Helper function for margin-left CSS property
 */
export const marginLeft = (value: SpacingValue): string =>
  `margin-left: ${spacing(value)};`;

/**
 * Helper function for padding-top CSS property
 */
export const paddingTop = (value: SpacingValue): string =>
  `padding-top: ${spacing(value)};`;

/**
 * Helper function for padding-right CSS property
 */
export const paddingRight = (value: SpacingValue): string =>
  `padding-right: ${spacing(value)};`;

/**
 * Helper function for padding-bottom CSS property
 */
export const paddingBottom = (value: SpacingValue): string =>
  `padding-bottom: ${spacing(value)};`;

/**
 * Helper function for padding-left CSS property
 */
export const paddingLeft = (value: SpacingValue): string =>
  `padding-left: ${spacing(value)};`;

