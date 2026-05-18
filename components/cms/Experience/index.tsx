import styled from "styled-components";
import { Box, Container, Flex, Text } from "@components/ions";
import { BREAKPOINTS } from "@constants";

export interface ExperienceItem {
  role: string;
  company: string;
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
  margin: 3rem 0;
`;

const SectionLabel = styled(Text)`
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  margin: 0 0 1.25rem;
`;

const Heading = styled.h2`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: 2.5rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  line-height: 1.1;
  margin: 0 0 3rem;
  max-width: 600px;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: 3.5rem;
  }
`;

const List = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const Item = styled.li`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  padding: 2rem 0;
  border-top: 1px solid ${({ theme }) => theme.colors.main};

  &:last-child {
    border-bottom: 1px solid ${({ theme }) => theme.colors.main};
  }

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    grid-template-columns: 200px 1fr;
    gap: 2rem;
  }
`;

const Period = styled(Text)`
  font-size: 0.8125rem;
  margin: 0 0 0.25rem;
`;

const Company = styled(Text)`
  font-size: 0.9375rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0;
`;

const Role = styled.h3`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: 1.25rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  margin: 0 0 0.625rem;
`;

const Description = styled(Text)`
  font-size: 0.9375rem;
  line-height: 1.65;
  margin: 0 0 1rem;
`;

const Tag = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.625rem;
  border: 1px solid ${({ theme }) => theme.colors.main};
  color: ${({ theme }) => theme.colors.paragraph};
  border-radius: ${({ theme }) => theme.radii.full};
`;

const Experience: React.FC<ExperienceProps> = ({ sectionLabel, heading, items }) => (
  <Section id="experience">
    <Container>
      <SectionLabel>{sectionLabel}</SectionLabel>
      <Heading>{heading}</Heading>
      <List>
        {items.map((item) => (
          <Item key={`${item.company}-${item.role}`}>
            <Box>
              <Period>{item.period}</Period>
              <Company>{item.company}</Company>
            </Box>
            <Box>
              <Role>{item.role}</Role>
              <Description>{item.description}</Description>
              {item.tags && item.tags.length > 0 && (
                <Flex wrap="wrap" gap="sm">
                  {item.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
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
