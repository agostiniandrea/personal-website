import styled, { css, keyframes } from "styled-components";
import { Box, Container, Heading, Text } from "@components/ions";
import { BREAKPOINTS } from "@constants";
import { journeyData, type JourneyProps } from "./model";

const SectionLabel = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  margin: 0 0 1.25rem;
`;

const SectionHeading = styled(Heading)`
  margin: 0 0 2rem;
`;

const Intro = styled(Text)`
  max-width: 680px;
  line-height: ${({ theme }) => theme.lineHeights.loose};
  margin-bottom: ${({ theme }) => theme.space["4xl"]};
`;

const Timeline = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const TimelineItem = styled.li`
  display: grid;
  grid-template-columns: 2.5rem 1fr;
  align-items: start;

  &:not(:last-child) > div:first-child::after {
    content: "";
    display: block;
    width: 2px;
    flex: 1;
    background: ${({ theme }) => theme.colors.highlight};
    opacity: 0.15;
    margin-top: ${({ theme }) => theme.space.md};
  }
`;

const DotColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  padding-top: 4px;
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
`;

const Dot = styled.div<{ $ongoing?: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.highlight};
  flex-shrink: 0;

  ${({ $ongoing, theme }) =>
    $ongoing
      ? css`
          background: transparent;
          animation: ${pulse} 2.4s ease-in-out infinite;
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
`;

const CityHeading = styled(Heading)`
  margin: 0 0 0.375rem;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    display: inline;
    margin-right: ${({ theme }) => theme.space.lg};
  }
`;

const CountryLabel = styled(Text)`
  display: inline-block;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.paragraph};
  margin-bottom: 0.375rem;
`;

const DateLabel = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.highlight};
  margin: 0 0 ${({ theme }) => theme.space.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Description = styled(Text)`
  max-width: 640px;
  line-height: ${({ theme }) => theme.lineHeights.loose};
`;

const Journey: React.FC<JourneyProps> = ({
  sectionLabel = journeyData.sectionLabel,
  heading = journeyData.heading,
  intro = journeyData.intro,
  chapters = journeyData.chapters,
}) => (
  <Container>
    <Box py="5xl">
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
                <CityHeading size="card">{chapter.city}</CityHeading>
              </Box>
              <DateLabel>
                {chapter.age ? `${chapter.age} anni · ` : ""}
                {chapter.years}
                {chapter.isOngoing && " ?"}
              </DateLabel>
              <Description>{chapter.description}</Description>
            </ItemContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  </Container>
);

export default Journey;
export type { JourneyProps };
