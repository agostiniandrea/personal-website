import styled from "styled-components";
import { Box, Container, Flex, Grid, Heading, Link, Text } from "@components/ions";
import { Badge } from "@components/molecules";

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

const SectionHeading = styled(Heading)`
  margin: 0 0 3rem;
  max-width: 600px;
`;

const ProjectsGrid = styled(Grid)`
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

const CardTitle = styled(Heading).attrs({ size: "card", as: "h3" })`
  margin: 0 0 0.75rem;
`;

const CardDescription = styled(Text)`
  margin-bottom: 1.5rem;
  flex: 1;
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
      <SectionHeading>{heading}</SectionHeading>
      <ProjectsGrid columns={[1, undefined, 2, undefined, 3]} gap="1.5rem">
        {items.map((item) => (
          <Card key={item.title}>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription variant="small">{item.description}</CardDescription>
            {item.tags && item.tags.length > 0 && (
              <Flex gap="sm" wrap="wrap" styles="margin-bottom: 1.5rem;">
                {item.tags.map((tag) => (
                  <Badge key={tag} size="sm">{tag}</Badge>
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
      </ProjectsGrid>
    </Container>
  </Box>
);

export default Projects;
