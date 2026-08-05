import styled from "styled-components";

import { Flex, Link } from "@components/ions";
import { Section } from "@components/molecules";
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

// Extend the Link ion with contact-specific typography
const ContactLink = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const Contact: React.FC<ContactProps> = ({
  sectionLabel,
  heading,
  body,
  links,
}) => (
  <Section id="contact" eyebrow={sectionLabel} heading={heading} body={body}>
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
  </Section>
);

export default Contact;
