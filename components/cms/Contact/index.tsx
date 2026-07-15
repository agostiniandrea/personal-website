import styled from "styled-components";

import { Box, Container, Flex, Heading, Link, Text } from "@components/ions";
import { SectionLabel } from "@components/molecules";
import { trackContactInteraction } from "@lib/utils/analytics";

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

const SectionHeading = styled(Heading)`
  margin: 0 0 2rem;
  max-width: 600px;
`;

// Extend the Link ion with contact-specific typography
const ContactLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

// Extend the Text ion with layout constraints for this section
const Body = styled(Text)`
  line-height: ${({ theme }) => theme.lineHeights.loose};
  margin-bottom: ${({ theme }) => theme.space["2xl"]};
  max-width: 600px;
`;

const Contact: React.FC<ContactProps> = ({ sectionLabel, heading, body, links }) => (
  <Box as="section" id="contact" my="4xl">
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
            onClick={() => trackContactInteraction(link.url, "contact")}
          >
            {link.label}
          </ContactLink>
        ))}
      </Flex>
    </Container>
  </Box>
);

export default Contact;
