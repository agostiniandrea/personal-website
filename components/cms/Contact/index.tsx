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

/* A mailto: link must not open in a new tab: browsers hand it to the mail
   handler anyway, and target=_blank can leave a blank tab or be treated as a
   popup. */
const opensInNewTab = (url: string) =>
  !url.startsWith("#") && !url.startsWith("/") && !url.startsWith("mailto:");

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
          isExternal={opensInNewTab(link.url)}
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
