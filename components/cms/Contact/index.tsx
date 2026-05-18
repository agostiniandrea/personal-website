import styled from "styled-components";
import { Box, Container, Flex, Link, Text } from "@components/ions";
import { BREAKPOINTS } from "@constants";

export interface ContactLink {
  label: string;
  url: string;
}

export interface ContactProps {
  sectionLabel: string;
  heading: string;
  body: string;
  links: ContactLink[];
}

// Custom styling on top of ions where the design requires specific tokens
// not covered by the base components (highlight color, heading font, sizes)
const SectionLabel = styled.p`
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
  margin: 0 0 2rem;
  max-width: 600px;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    font-size: 3.5rem;
  }
`;

// Extend the Link ion with contact-specific typography
const ContactLink = styled(Link)`
  font-size: 1.125rem;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

// Extend the Text ion with layout constraints for this section
const Body = styled(Text)`
  max-width: 600px;
  line-height: 1.7;
  margin-bottom: 2.5rem;
`;

const Contact: React.FC<ContactProps> = ({ sectionLabel, heading, body, links }) => (
  <Box as="section" id="contact" my="3xl">
    <Container>
      <SectionLabel>{sectionLabel}</SectionLabel>
      <Heading>{heading}</Heading>
      <Body variant="large">{body}</Body>
      <Flex gap="xl" wrap="wrap">
        {links.map((link) => (
          <ContactLink
            key={link.url}
            href={link.url}
            isExternal={!link.url.startsWith("#") && !link.url.startsWith("/")}
            ariaLabel={link.label}
          >
            {link.label}
          </ContactLink>
        ))}
      </Flex>
    </Container>
  </Box>
);

export default Contact;
