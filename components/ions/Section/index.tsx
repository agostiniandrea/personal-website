import { forwardRef } from "react";

import styled, { Interpolation } from "styled-components";

import { BREAKPOINTS_BELOW } from "@constants";

type SectionElement = "section" | "div" | "article" | "aside";

interface SectionProps {
  as?: SectionElement;
  id?: string;
  className?: string;
  children: React.ReactNode;
  styles?: Interpolation<React.CSSProperties>;
}

interface StyledSectionProps {
  $styles?: Interpolation<React.CSSProperties>;
}

/* Single source of truth for the vertical rhythm between page sections.
   Incremental ladder: 1.5rem on phones (< 900px, bottom-nav layout),
   2rem on tablet (900–1199), 3rem on desktop (≥ 1200). Change it here to
   change it everywhere. Horizontal gutters stay with <Container>. */
const StyledSection = styled.section.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith("$"),
})<StyledSectionProps>`
  padding-bottom: ${({ theme }) => theme.space["3xl"]};
  padding-top: ${({ theme }) => theme.space["3xl"]};

  @media (max-width: ${BREAKPOINTS_BELOW.tablet}) {
    padding-bottom: ${({ theme }) => theme.space["2xl"]};
    padding-top: ${({ theme }) => theme.space["2xl"]};
  }

  @media (max-width: ${BREAKPOINTS_BELOW.xTablet}) {
    padding-bottom: ${({ theme }) => theme.space.xl};
    padding-top: ${({ theme }) => theme.space.xl};
  }

  ${({ $styles }) => $styles}
`;

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ as = "section", id, className, children, styles }, ref) => (
    <StyledSection
      ref={ref}
      as={as}
      id={id}
      className={className}
      $styles={styles}
    >
      {children}
    </StyledSection>
  ),
);

Section.displayName = "Section";

export default Section;
