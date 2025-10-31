import { toSpacing, type SpacingToken } from "@config/tokens";
import styled, { Interpolation } from "styled-components";

type SpacingValue = SpacingToken | number | string;

type SpacingProps = {
  // Margin
  m?: SpacingValue;
  mt?: SpacingValue;
  mr?: SpacingValue;
  mb?: SpacingValue;
  ml?: SpacingValue;
  mx?: SpacingValue;
  my?: SpacingValue;

  // Padding
  p?: SpacingValue;
  pt?: SpacingValue;
  pr?: SpacingValue;
  pb?: SpacingValue;
  pl?: SpacingValue;
  px?: SpacingValue;
  py?: SpacingValue;

  // Gap
  gap?: SpacingValue;
  rowGap?: SpacingValue;
  columnGap?: SpacingValue;
};

interface StyledBoxProps {
  $m?: SpacingValue;
  $mt?: SpacingValue;
  $mr?: SpacingValue;
  $mb?: SpacingValue;
  $ml?: SpacingValue;
  $mx?: SpacingValue;
  $my?: SpacingValue;
  $p?: SpacingValue;
  $pt?: SpacingValue;
  $pr?: SpacingValue;
  $pb?: SpacingValue;
  $pl?: SpacingValue;
  $px?: SpacingValue;
  $py?: SpacingValue;
  $gap?: SpacingValue;
  $rowGap?: SpacingValue;
  $columnGap?: SpacingValue;
}

const StyledBox = styled.div<StyledBoxProps>`
  ${({ $m }) => $m !== undefined && `margin: ${toSpacing($m)};`}
  ${({ $mt }) => $mt !== undefined && `margin-top: ${toSpacing($mt)};`}
  ${({ $mr }) => $mr !== undefined && `margin-right: ${toSpacing($mr)};`}
  ${({ $mb }) => $mb !== undefined && `margin-bottom: ${toSpacing($mb)};`}
  ${({ $ml }) => $ml !== undefined && `margin-left: ${toSpacing($ml)};`}
  ${({ $mx }) =>
    $mx !== undefined &&
    `margin-left: ${toSpacing($mx)}; margin-right: ${toSpacing($mx)};`}
  ${({ $my }) =>
    $my !== undefined &&
    `margin-top: ${toSpacing($my)}; margin-bottom: ${toSpacing($my)};`}

  ${({ $p }) => $p !== undefined && `padding: ${toSpacing($p)};`}
  ${({ $pt }) => $pt !== undefined && `padding-top: ${toSpacing($pt)};`}
  ${({ $pr }) => $pr !== undefined && `padding-right: ${toSpacing($pr)};`}
  ${({ $pb }) => $pb !== undefined && `padding-bottom: ${toSpacing($pb)};`}
  ${({ $pl }) => $pl !== undefined && `padding-left: ${toSpacing($pl)};`}
  ${({ $px }) =>
    $px !== undefined &&
    `padding-left: ${toSpacing($px)}; padding-right: ${toSpacing($px)};`}
  ${({ $py }) =>
    $py !== undefined &&
    `padding-top: ${toSpacing($py)}; padding-bottom: ${toSpacing($py)};`}

  ${({ $gap }) => $gap !== undefined && `gap: ${toSpacing($gap)};`}
  ${({ $rowGap }) => $rowGap !== undefined && `row-gap: ${toSpacing($rowGap)};`}
  ${({ $columnGap }) =>
    $columnGap !== undefined && `column-gap: ${toSpacing($columnGap)};`}
`;

interface BoxProps extends SpacingProps {
  children?: React.ReactNode;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  styles?: Interpolation<React.CSSProperties>;
}

const Box: React.FC<BoxProps> = ({
  children,
  as,
  className,
  styles,
  m,
  mt,
  mr,
  mb,
  ml,
  mx,
  my,
  p,
  pt,
  pr,
  pb,
  pl,
  px,
  py,
  gap,
  rowGap,
  columnGap,
}) => {
  return (
    <StyledBox
      as={as}
      className={className}
      $m={m}
      $mt={mt}
      $mr={mr}
      $mb={mb}
      $ml={ml}
      $mx={mx}
      $my={my}
      $p={p}
      $pt={pt}
      $pr={pr}
      $pb={pb}
      $pl={pl}
      $px={px}
      $py={py}
      $gap={gap}
      $rowGap={rowGap}
      $columnGap={columnGap}
      style={styles as React.CSSProperties}
    >
      {children}
    </StyledBox>
  );
};

export default Box;

