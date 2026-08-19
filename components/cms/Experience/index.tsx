import styled from "styled-components";

import { Box, Flex, Heading, Text } from "@components/ions";
import { Badge, Section } from "@components/molecules";
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

const List = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Item = styled.li`
  display: grid;
  gap: ${({ theme }) => theme.space.lg};
  grid-template-columns: 1fr;
  padding: ${({ theme }) => theme.space["2xl"]} 0;

  @media (max-width: ${BREAKPOINTS_BELOW.mobile}) {
    padding: ${({ theme }) => theme.space.xl} 0;

    /* The section's own bottom padding already closes the list on phones, so
       the last entry would otherwise stack two gaps before the tab bar. */
    &:last-child {
      padding-bottom: 0;
    }
  }

  /* Rules sit only between entries: one under the heading would detach the list
     from it, and one at the end would float just above the fixed tab bar.
     Whitespace closes the list instead. */
  &:first-child {
    padding-top: 0;
  }

  &:not(:first-child) {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    gap: ${({ theme }) => theme.space["2xl"]};
    grid-template-columns: 200px 1fr;
  }
`;

const Period = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin: 0 0 ${({ theme }) => theme.space.xs};
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

const Experience: React.FC<ExperienceProps> = ({
  sectionLabel,
  heading,
  intro = DEFAULT_EXPERIENCE_INTRO,
  items,
}) => (
  <Section
    id="experience"
    eyebrow={sectionLabel}
    heading={heading}
    body={intro}
  >
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
  </Section>
);

export default Experience;
