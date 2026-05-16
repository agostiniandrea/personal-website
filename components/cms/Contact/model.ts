import { ContactProps } from "./index";

export const defaultContact: ContactProps = {
  sectionLabel: "Contact",
  heading: "Let's work together",
  body: "I'm available for remote frontend and tech lead roles, freelance projects, and consulting. If you're building something with React, Next.js, or Shopify — let's talk.",
  links: [
    { label: "Email me", url: "mailto:test@test.com" },
    { label: "LinkedIn", url: "https://linkedin.com/in/andreaagostini" },
    { label: "GitHub", url: "https://github.com/agostiniandrea" },
  ],
};

export const minimalContact: ContactProps = {
  sectionLabel: "Contact",
  heading: "Get in touch",
  body: "Let's talk.",
  links: [{ label: "Email me", url: "mailto:test@test.com" }],
};
