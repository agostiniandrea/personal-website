import { forwardRef } from "react";

import styled, { Interpolation } from "styled-components";

import { Container, Heading, Text } from "@components/ions";
import { BREAKPOINTS_BELOW } from "@constants";

import SectionLabel from "../SectionLabel";

type SectionElement = "section" | "div" | "article" | "aside";

interface SectionProps {
  as?: SectionElement;
  id?: string;
  className?: string;
  /* Optional shared header — eyebrow → heading → body — rendered above the
     children with a uniform rhythm. Sections with a bespoke header omit these
     and render their own header inside `children`. */
  eyebrow?: string;
  heading?: string;
  body?: string;
  headingSize?: "display" | "section" | "card";
  children: React.ReactNode;
  styles?: Interpolation<React.CSSProperties>;
}

interface StyledSectionProps {
  $styles?: Interpolation<React.CSSProperties>;
}

/* One wrapper for every page section: the vertical rhythm (1.5rem < 900px,
   2rem 900–1199, 3rem ≥ 1200), the horizontal gutter (via Container) and the
   common eyebrow/heading/body header all live here — change them once. */
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

const Title = styled(Heading)`
  margin: 0 0 ${({ theme }) => theme.space["2xl"]};
  max-width: 640px;

  @media (max-width: ${BREAKPOINTS_BELOW.xTablet}) {
    margin-bottom: ${({ theme }) => theme.space.lg};
  }
`;

const Body = styled(Text)`
  line-height: ${({ theme }) => theme.lineHeights.loose};
  margin: 0 0 ${({ theme }) => theme.space["2xl"]};
  max-width: 680px;

  @media (max-width: ${BREAKPOINTS_BELOW.xTablet}) {
    margin-bottom: ${({ theme }) => theme.space.lg};
  }
`;

const Section = forwardRef<HTMLElement, SectionProps>(
  (
    {
      as = "section",
      id,
      className,
      eyebrow,
      heading,
      body,
      headingSize = "section",
      children,
      styles,
    },
    ref,
  ) => (
    <StyledSection
      ref={ref}
      as={as}
      id={id}
      className={className}
      $styles={styles}
    >
      <Container>
        {eyebrow && <SectionLabel>{eyebrow}</SectionLabel>}
        {heading && <Title size={headingSize}>{heading}</Title>}
        {body && <Body variant="large">{body}</Body>}
        {children}
      </Container>
    </StyledSection>
  ),
);

Section.displayName = "Section";

export default Section;
