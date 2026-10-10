import React from "react";

import { useRouter } from "next/router";

import styled from "styled-components";

import { BREAKPOINTS } from "@constants";
import { alpha } from "@lib/utils/color";
import { getAnniversaryCopy } from "@lib/utils/thailandAnniversary";

/* The flag's own colours, used only here and only for this small mark. They are
   not theme tokens on purpose: they identify the anniversary and must not turn
   into a second accent for the rest of the site. */
const THAI_RED = "#a51931";
const THAI_WHITE = "#f4f5f8";
const THAI_NAVY = "#2d2a4a";

/* Five stripes in the flag's 1 : 1 : 2 : 1 : 1 proportion, drawn with hard
   gradient stops so there is no image, no SVG and nothing to load. The hairline
   ring keeps the white stripes readable on the light ground and the navy on the
   dark one. Decorative: the label already says it. */
export const ThaiFlag = styled.span.attrs({ "aria-hidden": "true" })`
  background: linear-gradient(
    to bottom,
    ${THAI_RED} 0 16.667%,
    ${THAI_WHITE} 16.667% 33.333%,
    ${THAI_NAVY} 33.333% 66.667%,
    ${THAI_WHITE} 66.667% 83.333%,
    ${THAI_RED} 83.333% 100%
  );
  border-radius: 2px;
  box-shadow: 0 0 0 1px ${({ theme }) => alpha(theme.colors.paragraph, 28)};
  display: block;
  flex-shrink: 0;
  height: 16px;
  width: 24px;
`;

/* The flag as a thin rule over the Forest counter: the same five stripes,
   stretched, so the two uses read as one mark. */
const ThaiStripe = styled(ThaiFlag)`
  height: 8px;
  width: 100%;
`;

const Block = styled.div<{ $stacked: boolean }>`
  align-items: ${({ $stacked }) => ($stacked ? "stretch" : "center")};
  display: flex;
  flex-direction: ${({ $stacked }) => ($stacked ? "column" : "row")};
  gap: ${({ theme, $stacked }) => ($stacked ? theme.space.md : "0.625rem")};
  text-align: left;

  /* under the counter it follows the counter: left on phones, centred beside
     the number once the card is two columns */
  @media (min-width: ${BREAKPOINTS.xTablet}) {
    text-align: ${({ $stacked }) => ($stacked ? "center" : "left")};
  }
`;

const Text = styled.div<{ $stacked: boolean }>`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: 2px;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    align-items: ${({ $stacked }) => ($stacked ? "center" : "flex-start")};
  }
`;

/* Navy in the hero, where the gold belongs to the tree badge. Under the Forest
   counter the title joins the milestone gold, with the flag stripe above it
   carrying the Thai colours. */
const Label = styled.span<{ $stacked: boolean }>`
  color: ${({ theme, $stacked }) =>
    $stacked ? theme.colors.milestone : theme.colors.thaiNavy};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.1em;
  line-height: 1.3;
  text-transform: uppercase;
`;

const Dates = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.08em;
  line-height: 1.3;
  text-transform: uppercase;
`;

interface ThailandAnniversaryProps {
  /** "inline": flag beside the title and dates (hero).
      "stacked": flag above a centred label and dates (Forest counter). */
  variant?: "inline" | "stacked";
  className?: string;
}

const ThailandAnniversary: React.FC<ThailandAnniversaryProps> = ({
  variant = "inline",
  className,
}) => {
  const { locale } = useRouter();
  const copy = getAnniversaryCopy(locale);
  const stacked = variant === "stacked";

  return (
    <Block
      $stacked={stacked}
      className={className}
      data-testid="thailand-anniversary"
    >
      {stacked ? <ThaiStripe /> : <ThaiFlag />}
      <Text $stacked={stacked}>
        <Label $stacked={stacked}>{copy.label}</Label>
        <Dates>
          <span aria-hidden="true">
            {copy.from} — {copy.to}
          </span>
          <span className="sr-only">{copy.datesSpoken}</span>
        </Dates>
      </Text>
    </Block>
  );
};

export default ThailandAnniversary;
