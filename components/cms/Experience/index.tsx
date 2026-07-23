import styled from "styled-components";

import { Box, Container, Flex, Heading, Text } from "@components/ions";
import { Badge, SectionLabel } from "@components/molecules";
import StorySegmentedControl from "@components/organisms/MobileNav/StorySegmentedControl";
import { BREAKPOINTS, BREAKPOINTS_BELOW } from "@constants";

export interface ExperienceItem {
  role: string;
  company: string;
  location?: string;
  period: string;
  description: string;
  tags?: string[];
}

export const DEFAULT_EXPERIENCE_INTRO =
  "From ecommerce storefronts to design systems — the companies, projects and teams I've helped grow over the last ten years.";

export interface ExperienceProps {
  sectionLabel: string;
  heading: string;
  items: ExperienceItem[];
  intro?: string;
}

const Section = styled.section`
  padding: ${({ theme }) => theme.space["3xl"]} 0;
  @media (max-width: ${BREAKPOINTS_BELOW.tablet}) {
    padding-bottom: 2rem;
    padding-top: 2rem;
  }
`;

const SectionHeading = styled(Heading)`
  margin: 0 0 ${({ theme }) => theme.space["2xl"]};
  max-width: 600px;
  @media (max-width: ${BREAKPOINTS_BELOW.tablet}) {
    margin-bottom: 1rem;
  }
`;

const List = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Item = styled.li`
  border-top: 1px solid ${({ theme }) => theme.colors.main};
  display: grid;
  gap: ${({ theme }) => theme.space.lg};
  grid-template-columns: 1fr;
  padding: ${({ theme }) => theme.space["2xl"]} 0;

  &:last-child {
    border-bottom: 1px solid ${({ theme }) => theme.colors.main};
  }

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    gap: ${({ theme }) => theme.space["2xl"]};
    grid-template-columns: 200px 1fr;
  }
`;

const Period = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin: 0 0 0.25rem;
`;

const Company = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0 0 0.125rem;
`;

const Location = styled(Text)`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin: 0;
`;

const Role = styled(Heading).attrs({ size: "card", as: "h3" })`
  margin: 0 0 0.625rem;
`;

const Description = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: 0 0 ${({ theme }) => theme.space.lg};
`;

const Intro = styled(Text)`
  line-height: ${({ theme }) => theme.lineHeights.loose};
  margin-bottom: ${({ theme }) => theme.space["4xl"]};
  max-width: 680px;
  @media (max-width: ${BREAKPOINTS_BELOW.tablet}) {
    margin-bottom: 1rem;
  }
`;

const Experience: React.FC<ExperienceProps> = ({
  sectionLabel,
  heading,
  intro = DEFAULT_EXPERIENCE_INTRO,
  items,
}) => (
  <Section id="experience">
    <Container>
      <SectionLabel>{sectionLabel}</SectionLabel>
      <SectionHeading>{heading}</SectionHeading>
      {/* mirrors Journey's intro so the segmented control sits at the same
          height when switching between the two story sub-views */}
      {intro && <Intro variant="large">{intro}</Intro>}
      <StorySegmentedControl />
      <List>
        {items.map((item) => (
          <Item key={`${item.company}-${item.role}`}>
            <Box>
              <Period>{item.period}</Period>
              <Company>{item.company}</Company>
              {item.location && <Location>{item.location}</Location>}
            </Box>
            <Box>
              <Role>{item.role}</Role>
              <Description>{item.description}</Description>
              {item.tags && item.tags.length > 0 && (
                <Flex wrap="wrap" gap="sm">
                  {item.tags.map((tag) => (
                    <Badge key={tag} size="sm">
                      {tag}
                    </Badge>
                  ))}
                </Flex>
              )}
            </Box>
          </Item>
        ))}
      </List>
    </Container>
  </Section>
);

export default Experience;
