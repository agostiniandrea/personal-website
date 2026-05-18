import styled from "styled-components";
import { Box, Container, Text } from "@components/ions";
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

const Skill = styled.li`
  font-size: 0.875rem;
  padding: 0.375rem 0.875rem;
  border: 1px solid ${({ theme }) => theme.colors.main};
  color: ${({ theme }) => theme.colors.paragraph};
  border-radius: ${({ theme }) => theme.radii.full};
`;

const Skills: React.FC<SkillsProps> = ({ sectionLabel, heading, categories }) => (
  <Section id="skills">
    <Container>
      <SectionLabel>{sectionLabel}</SectionLabel>
      <Heading>{heading}</Heading>
      <Grid>
        {categories.map((category) => (
          <Box key={category.title}>
            <CategoryTitle>{category.title}</CategoryTitle>
            <SkillList>
              {category.skills.map((skill) => (
                <Skill key={skill}>{skill}</Skill>
              ))}
            </SkillList>
          </Box>
        ))}
      </Grid>
    </Container>
  </Section>
);

export default Skills;
