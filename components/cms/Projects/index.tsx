import styled from "styled-components";
import { Box, Container, Flex, Link, Text } from "@components/ions";
import { BREAKPOINTS } from "@constants";

export interface ProjectItem {
  title: string;
  description: string;
  tags?: string[];
  url?: string;
  urlLabel?: string;
}

export interface ProjectsProps {
  sectionLabel: string;
  heading: string;
  items: ProjectItem[];
}

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
  gap: 1.5rem;

  @media (min-width: ${BREAKPOINTS.xTablet}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${BREAKPOINTS.desktop}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Card = styled.article`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.main};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.highlight};
  }
`;

const CardTitle = styled.h3`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: 1.25rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  margin: 0 0 0.75rem;
`;

const CardDescription = styled(Text)`
  margin-bottom: 1.5rem;
  flex: 1;
`;

const Tag = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.625rem;
  border: 1px solid ${({ theme }) => theme.colors.main};
  color: ${({ theme }) => theme.colors.paragraph};
  border-radius: ${({ theme }) => theme.radii.full};
`;

const CardLink = styled(Link)`
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  align-self: flex-start;

  &:hover {
    text-decoration: underline;
  }
`;

const Projects: React.FC<ProjectsProps> = ({ sectionLabel, heading, items }) => (
  <Box as="section" id="projects" my="3xl">
    <Container>
      <SectionLabel>{sectionLabel}</SectionLabel>
      <Heading>{heading}</Heading>
      <Grid>
        {items.map((item) => (
          <Card key={item.title}>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription variant="small">{item.description}</CardDescription>
            {item.tags && item.tags.length > 0 && (
              <Flex gap="sm" wrap="wrap" styles="margin-bottom: 1.5rem;">
                {item.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Flex>
            )}
            {item.url && (
              <CardLink
                href={item.url}
                isExternal
                ariaLabel={`View project: ${item.title}`}
              >
                {item.urlLabel ?? "View project →"}
              </CardLink>
            )}
          </Card>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default Projects;
