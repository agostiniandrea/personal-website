import styled from "styled-components";

import { Box, Container, Heading } from "@components/ions";
import { Badge, SectionLabel } from "@components/molecules";
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
  padding: ${({ theme }) => theme.space["3xl"]} 0;
  @media (max-width: 1199px) {
    padding-bottom: 2rem;
    padding-top: 2rem;
  }
`;

const SectionHeading = styled(Heading)`
  margin: 0 0 3rem;
  max-width: 600px;
  @media (max-width: 1199px) {
    margin-bottom: 1.5rem;
  }
`;

const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.space["2xl"]};
  grid-template-columns: 1fr;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${BREAKPOINTS.tablet}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;


const CategoryTitle = styled.h3`
  color: ${({ theme }) => theme.colors.highlight};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.12em;
  margin: 0 0 ${({ theme }) => theme.space.lg};
  text-transform: uppercase;
`;

const SkillList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space.sm};
  list-style: none;
  margin: 0;
  padding: 0;
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
