import styled from "styled-components";

import { Box, Container, Flex, Heading, Text } from "@components/ions";
import { Badge, SectionLabel } from "@components/molecules";
import { BREAKPOINTS } from "@constants";

export interface ExperienceItem {
  role: string;
  company: string;
  location?: string;
  period: string;
  description: string;
  tags?: string[];
}

export interface ExperienceProps {
  sectionLabel: string;
  heading: string;
  items: ExperienceItem[];
}

const Section = styled.section`
  padding: ${({ theme }) => theme.space["3xl"]} 0;
  @media (max-width: 1199px) {
    padding-bottom: 2rem;
    padding-top: 2rem;
  }
`;

const SectionHeading = styled(Heading)`
  margin: 0 0 ${({ theme }) => theme.space["3xl"]};
  max-width: 600px;
  @media (max-width: 1199px) {
    margin-bottom: 1.5rem;
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


const Experience: React.FC<ExperienceProps> = ({ sectionLabel, heading, items }) => (
  <Section id="experience">
    <Container>
      <SectionLabel>{sectionLabel}</SectionLabel>
      <SectionHeading>{heading}</SectionHeading>
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
                    <Badge key={tag} size="sm">{tag}</Badge>
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
