import styled from "styled-components";
import { Box, Container, Flex, Heading, Text } from "@components/ions";
import { Badge } from "@components/molecules";

export interface AboutProps {
  sectionLabel: string;
  heading: string;
  bio: string;
  location?: string;
  availability?: string;
}

const SectionLabel = styled(Text)`
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  margin: 0 0 1.25rem;
`;

const SectionHeading = styled(Heading)`
  margin: 0 0 2rem;
  max-width: 600px;
`;

const Bio = styled(Text)`
  max-width: 680px;
  line-height: 1.7;
  margin-bottom: 2.5rem;
`;


const About: React.FC<AboutProps> = ({
  sectionLabel,
  heading,
  bio,
  location,
  availability,
}) => {
  const tags = [location, availability].filter(Boolean) as string[];

  return (
    <Box as="section" id="about" my="3xl">
      <Container>
        <SectionLabel>{sectionLabel}</SectionLabel>
        <SectionHeading>{heading}</SectionHeading>
        <Bio variant="large">{bio}</Bio>
        {tags.length > 0 && (
          <Flex gap="md" wrap="wrap">
            {tags.map((tag) => (
              <Badge key={tag} size="md">{tag}</Badge>
            ))}
          </Flex>
        )}
      </Container>
    </Box>
  );
};

export default About;
