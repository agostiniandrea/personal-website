import React from "react";

import styled from "styled-components";

import { WEBSITE_CARBON } from "@constants";

interface CarbonBadgeProps {
  className?: string;
  /** One-colour version (the theme's paragraph colour) instead of indigo + mint.
   *  Same box, same text: only the colours change. */
  monochrome?: boolean;
}

interface MonoProps {
  $mono: boolean;
}

// Visually replicates the official Website Carbon badge (dark variant) with
// its own brand colours, but renders the last verified result statically —
// no third-party script, no API call on page view. The value lives in
// constants/websiteCarbon.ts and is updated after significant changes.
const WC_INDIGO = "#0e11a8";
const WC_MINT = "#00ffbc";

const Wrapper = styled.span<MonoProps>`
  display: inline-flex;
  align-items: stretch;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 15px;
  line-height: 1.15;
`;

const Segment = styled.span<MonoProps>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0.3em 0.5em;
  border: 0.13em solid
    ${({ $mono, theme }) => ($mono ? theme.colors.paragraph : WC_MINT)};
`;

const Value = styled(Segment)`
  background: ${({ $mono }) => ($mono ? "transparent" : "#fff")};
  color: ${({ $mono, theme }) => ($mono ? theme.colors.paragraph : WC_INDIGO)};
  border-right: 0;
  border-radius: 0.3em 0 0 0.3em;
  min-width: 8.2em;
`;

const SourceLink = styled(Segment).attrs({ as: "a" })`
  background: ${({ $mono, theme }) =>
    $mono ? theme.colors.paragraph : WC_MINT};
  color: ${({ $mono, theme }) => ($mono ? theme.colors.badgeBg : WC_INDIGO)};
  font-weight: 700;
  text-decoration: none;
  border-left: 0;
  border-radius: 0 0.3em 0.3em 0;
`;

const CarbonBadge: React.FC<CarbonBadgeProps> = ({
  className,
  monochrome = false,
}) => (
  <Wrapper className={className} $mono={monochrome}>
    <Value $mono={monochrome}>
      {WEBSITE_CARBON.emissions}
      {WEBSITE_CARBON.unit}
    </Value>
    <SourceLink
      $mono={monochrome}
      href={WEBSITE_CARBON.resultUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Website Carbon result: ${WEBSITE_CARBON.emissions} grams of CO₂ per page view, tested ${WEBSITE_CARBON.testedAt}`}
    >
      {WEBSITE_CARBON.source}
    </SourceLink>
  </Wrapper>
);

export default CarbonBadge;
