import { useRouter } from "next/router";

import styled, { css, keyframes } from "styled-components";

import { Box, Container, Heading, Text } from "@components/ions";
import { SectionLabel } from "@components/molecules";
import { BREAKPOINTS } from "@constants";

import { journeyData, type JourneyProps } from "./model";

const JourneySection = styled.section`
  padding: ${({ theme }) => theme.space["3xl"]} 0;
  @media (max-width: 1199px) {
    padding-bottom: 2rem;
    padding-top: 2rem;
  }
`;

const SectionHeading = styled(Heading)`
  margin: 0 0 2rem;
  @media (max-width: 1199px) {
    margin-bottom: 1rem;
  }
`;

const Intro = styled(Text)`
  line-height: ${({ theme }) => theme.lineHeights.loose};
  margin-bottom: ${({ theme }) => theme.space["4xl"]};
  max-width: 680px;
  @media (max-width: 1199px) {
    margin-bottom: 1rem;
  }
`;

const Timeline = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const TimelineItem = styled.li`
  align-items: start;
  display: grid;
  grid-template-columns: 2.5rem 1fr;

  &:not(:last-child) > div:first-child::after {
    background: linear-gradient(
      to bottom,
      var(--color-ring-start),
      transparent
    );
    content: "";
    display: block;
    flex: 1;
    margin-top: ${({ theme }) => theme.space.md};
    width: 2px;
  }
`;

const DotColumn = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  padding-top: 4px;
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
`;

const Dot = styled.div<{ $ongoing?: boolean }>`
  border: 2px solid ${({ theme }) => theme.colors.highlight};
  border-radius: ${({ theme }) => theme.radii.rounded};
  flex-shrink: 0;
  height: 12px;
  width: 12px;

  ${({ $ongoing, theme }) =>
    $ongoing
      ? css`
          animation: ${pulse} 2.4s ease-in-out infinite;
          background: transparent;
        `
      : css`
          background: ${theme.colors.highlight};
        `}
`;

const ItemContent = styled.div`
  padding-bottom: ${({ theme }) => theme.space["4xl"]};

  li:last-child > & {
    padding-bottom: 0;
  }

  @media (max-width: 1199px) {
    padding-bottom: ${({ theme }) => theme.space["2xl"]};
  }
`;

const CityHeading = styled(Heading)`
  margin: 0 0 0.375rem;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: inline;
    margin-right: ${({ theme }) => theme.space.lg};
  }
`;

const CountryLabel = styled(Text)`
  color: ${({ theme }) => theme.colors.paragraph};
  display: inline-block;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.15em;
  margin-bottom: 0.375rem;
  text-transform: uppercase;
`;

const DateLabel = styled(Text)`
  color: ${({ theme }) => theme.colors.highlight};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0 0 ${({ theme }) => theme.space.xl};
`;

const Description = styled(Text)`
  line-height: ${({ theme }) => theme.lineHeights.loose};
  max-width: 640px;
`;

const Journey: React.FC<JourneyProps> = ({
  sectionLabel = journeyData.sectionLabel,
  heading = journeyData.heading,
  intro = journeyData.intro,
  chapters = journeyData.chapters,
}) => {
  const { locale } = useRouter();
  const yearsLabel = locale === "it" ? "anni" : "y.o.";
  return (
  <JourneySection id="journey">
  <Container>
      {sectionLabel && <SectionLabel>{sectionLabel}</SectionLabel>}
      {heading && (
        <SectionHeading size="section">{heading}</SectionHeading>
      )}
      {intro && <Intro variant="large">{intro}</Intro>}

      <Timeline aria-label="Life journey timeline">
        {chapters?.map((chapter) => (
          <TimelineItem key={chapter.city}>
            <DotColumn>
              <Dot $ongoing={chapter.isOngoing} />
            </DotColumn>
            <ItemContent>
              <CountryLabel>{chapter.country}</CountryLabel>
              <Box>
                <CityHeading size="card" as="h3">{chapter.city}</CityHeading>
              </Box>
              <DateLabel>
                {chapter.age ? `${chapter.age} ${yearsLabel} · ` : ""}
                {chapter.years}
                {chapter.isOngoing && " ?"}
              </DateLabel>
              <Description>{chapter.description}</Description>
            </ItemContent>
          </TimelineItem>
        ))}
      </Timeline>
  </Container>
  </JourneySection>
  );
};

export default Journey;
export type { JourneyProps };
