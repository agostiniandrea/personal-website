import { useRouter } from "next/router";
import styled from "styled-components";
import { Box, Container, Flex, Grid, Heading, Image, Link, Text } from "@components/ions";
import { Badge } from "@components/molecules";
import { contentfulImageUrl } from "@utils/contentfulImage";

const STATUS_LABELS: Record<string, Record<string, string>> = {
  "pre-launch": { en: "Pre-launch", it: "Pre lancio" },
  "internal":   { en: "Internal",   it: "Interno" },
};

export interface ProjectItem {
  title: string;
  description: string;
  tags?: string[];
  url?: string;
  urlLabel?: string;
  status?: "internal" | "pre-launch";
  image?: ImageProps;
}

export interface ProjectsProps {
  sectionLabel: string;
  heading: string;
  items: ProjectItem[];
}


const SectionLabel = styled(Text)`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  margin: 0 0 1.25rem;
`;

const SectionHeading = styled(Heading)`
  margin: 0 0 ${({ theme }) => theme.space["3xl"]};
  max-width: 600px;
  @media (max-width: 1199px) {
    margin-bottom: 1.5rem;
  }
`;

const ProjectsGrid = styled(Grid)``;

const Card = styled.article`
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.colors.main};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-ring-start), var(--color-ring-end));
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 1;
  }

  @media (hover: hover) {
    &:hover {
      border-color: ${({ theme }) => theme.colors.highlight};
      box-shadow: 0 4px 24px ${({ theme }) => theme.colors.surface};

      &::before {
        opacity: 1;
      }
    }
  }
`;

const ImageSlot = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  flex-shrink: 0;
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surface} 0%, ${({ theme }) => theme.colors.badgeBg} 100%);
  padding: 1rem;
`;

const PlaceholderText = styled.span`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.highlight};
  text-align: center;
  opacity: 0.6;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: ${({ theme }) => theme.space["2xl"]};
`;

const CardTitle = styled(Heading).attrs({ size: "card", as: "h3" })`
  margin: 0 0 ${({ theme }) => theme.space.md};
`;

const CardDescription = styled(Text)`
  margin-bottom: ${({ theme }) => theme.space.xl};
  flex: 1;
`;


const StatusTag = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.secondary};
  letter-spacing: 0.1em;
  text-transform: uppercase;
  align-self: flex-start;
`;

const CardLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  align-self: flex-start;

  &:hover {
    text-decoration: underline;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
  }
`;

const Projects: React.FC<ProjectsProps> = ({ sectionLabel, heading, items }) => {
  const { locale = "en" } = useRouter();
  return (
  <Box as="section" id="projects" py="3xl" styles="@media (max-width: 1199px) { padding-top: 2rem; padding-bottom: 2rem; }">
    <Container>
      <SectionLabel>{sectionLabel}</SectionLabel>
      <SectionHeading>{heading}</SectionHeading>
      <ProjectsGrid columns={[1, undefined, 2, undefined, 3]} gap="xl">
        {items.map((item) => (
          <Card key={item.title}>
            <ImageSlot>
              {item.image ? (
                <Image
                  src={contentfulImageUrl(item.image.url, { width: 1200, height: 675 })}
                  alt={item.image.alt || item.title}
                  width={1200}
                  height={675}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <Placeholder>
                  <PlaceholderText>{item.title}</PlaceholderText>
                </Placeholder>
              )}
            </ImageSlot>
            <CardBody>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription variant="small">
                {item.description}
              </CardDescription>
              {item.tags && item.tags.length > 0 && (
                <Flex gap="sm" wrap="wrap" styles="margin-bottom: 1.5rem;">
                  {item.tags.map((tag) => (
                    <Badge key={tag} size="sm">{tag}</Badge>
                  ))}
                </Flex>
              )}
              {item.url ? (
                <CardLink
                  href={item.url}
                  isExternal
                  ariaLabel={`View project: ${item.title}`}
                >
                  {item.urlLabel ?? "View project →"}
                </CardLink>
              ) : item.status ? (
                <StatusTag>— {STATUS_LABELS[item.status]?.[locale] ?? item.status}</StatusTag>
              ) : null}
            </CardBody>
          </Card>
        ))}
      </ProjectsGrid>
    </Container>
  </Box>
  );
};

export default Projects;
