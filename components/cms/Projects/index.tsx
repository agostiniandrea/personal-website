import { useRouter } from "next/router";
import styled from "styled-components";
import { Box, Container, Flex, Grid, Heading, Image, Link, Text } from "@components/ions";
import { Badge } from "@components/molecules";
import { contentfulImageUrl } from "@utils/contentfulImage";

const STATUS_LABELS: Record<string, Record<string, string>> = {
  "internal":   { en: "Internal",   it: "Interno" },
  "live":       { en: "Live",        it: "Live" },
  "pre-launch": { en: "Pre-launch", it: "Pre lancio" },
};

export interface ProjectItem {
  title: string;
  description: string;
  tags?: string[];
  url?: string;
  urlLabel?: string;
  status?: "internal" | "live" | "pre-launch";
  image?: ImageProps;
}

export interface ProjectsProps {
  sectionLabel: string;
  heading: string;
  items: ProjectItem[];
}


const SectionLabel = styled(Text)`
  color: ${({ theme }) => theme.colors.highlight};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.2em;
  margin: 0 0 1.25rem;
  text-transform: uppercase;
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
  border: 1px solid ${({ theme }) => theme.colors.main};
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::before {
    background: linear-gradient(90deg, var(--color-ring-start), var(--color-ring-end));
    content: '';
    height: 3px;
    left: 0;
    opacity: 0;
    position: absolute;
    right: 0;
    top: 0;
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
  aspect-ratio: 16 / 9;
  background: ${({ theme }) => theme.colors.surface};
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const Placeholder = styled.div`
  align-items: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.surface} 0%, ${({ theme }) => theme.colors.badgeBg} 100%);
  display: flex;
  height: 100%;
  justify-content: center;
  padding: ${({ theme }) => theme.space.lg};
  width: 100%;
`;

const PlaceholderText = styled.span`
  color: ${({ theme }) => theme.colors.highlight};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  opacity: 0.6;
  text-align: center;
`;

const CardBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${({ theme }) => theme.space["2xl"]};
`;

const CardTitle = styled(Heading).attrs({ size: "card", as: "h3" })`
  margin: 0 0 ${({ theme }) => theme.space.md};
`;

const CardDescription = styled(Text)`
  flex: 1;
  margin-bottom: ${({ theme }) => theme.space.xl};
`;


const StatusTag = styled.span`
  align-self: flex-start;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const CardLink = styled(Link)`
  align-self: flex-start;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};

  &:hover {
    text-decoration: underline;
  }

  &::after {
    content: "";
    inset: 0;
    position: absolute;
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
