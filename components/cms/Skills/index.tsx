import styled from "styled-components";
import { Box, Container, Heading, Text } from "@components/ions";
import { Badge } from "@components/molecules";
import { BREAKPOINTS } from "@constants";

export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface SkillsProps {
  sectionLabel: string;
  heading: string;
  categories: SkillCategory[];
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${BREAKPOINTS.tablet}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;


const CategoryTitle = styled.h3`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  margin: 0 0 1rem;
`;

const SkillList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;


const Skills: React.FC<SkillsProps> = ({ sectionLabel, heading, categories }) => (
  <Section id="skills">
    <Container>
      <SectionLabel>{sectionLabel}</SectionLabel>
      <SectionHeading>{heading}</SectionHeading>
      <Grid>
        {categories.map((category) => (
          <Box key={category.title}>
            <CategoryTitle>{category.title}</CategoryTitle>
            <SkillList>
              {category.skills.map((skill) => (
                <Badge key={skill} as="li" size="md">{skill}</Badge>
              ))}
            </SkillList>
          </Box>
        ))}
      </Grid>
    </Container>
  </Section>
);

export default Skills;
