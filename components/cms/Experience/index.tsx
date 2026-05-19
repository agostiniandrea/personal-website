import styled from "styled-components";
import { Box, Container, Flex, Heading, Text } from "@components/ions";
import { Badge } from "@components/molecules";
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

const SectionHeading = styled(Heading)`
  margin: 0 0 3rem;
  max-width: 600px;
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

const Role = styled(Heading).attrs({ size: "card", as: "h3" })`
  margin: 0 0 0.625rem;
`;

const Description = styled(Text)`
  font-size: 0.9375rem;
  line-height: 1.65;
  margin: 0 0 1rem;
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
