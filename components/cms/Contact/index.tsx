import styled from "styled-components";
import { Box, Container, Flex, Heading, Link, Text } from "@components/ions";

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
      <SectionHeading>{heading}</SectionHeading>
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
