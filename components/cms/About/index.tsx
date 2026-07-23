import styled from "styled-components";

import { Box, Container, Flex, Heading, Text } from "@components/ions";
import { Badge, SectionLabel } from "@components/molecules";
import { BREAKPOINTS_BELOW } from "@constants";

export interface AboutProps {
  sectionLabel: string;
  heading: string;
  bio: string;
  location?: string;
  availability?: string;
}

const SectionHeading = styled(Heading)`
  margin: 0 0 2rem;
  max-width: 600px;
  @media (max-width: ${BREAKPOINTS_BELOW.tablet}) {
    margin-bottom: 1.5rem;
  }
`;

const Bio = styled(Text)`
  line-height: ${({ theme }) => theme.lineHeights.loose};
  margin-bottom: ${({ theme }) => theme.space["2xl"]};
  max-width: 680px;
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
    <Box
      as="section"
      id="about"
      py="3xl"
      styles={`
        @media (max-width: ${BREAKPOINTS_BELOW.tablet}) {
          padding-bottom: 2rem;
          padding-top: 2rem;
        }
        @media (max-width: ${BREAKPOINTS_BELOW.xTablet}) {
          padding-top: 0.5rem;
        }
      `}
    >
      <Container>
        <SectionLabel>{sectionLabel}</SectionLabel>
        <SectionHeading>{heading}</SectionHeading>
        <Bio variant="large">{bio}</Bio>
        {tags.length > 0 && (
          <Flex gap="md" wrap="wrap">
            {tags.map((tag) => (
              <Badge key={tag} size="md">
                {tag}
              </Badge>
            ))}
          </Flex>
        )}
      </Container>
    </Box>
  );
};

export default About;
