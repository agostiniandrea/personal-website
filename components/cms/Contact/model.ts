import { ContactProps } from "./index";

export const defaultContact: ContactProps = {
  sectionLabel: "Contact",
  heading: "Let's work together",
  body: "Currently with capacity for new projects — remote frontend and tech lead roles, freelance, and consulting. If you're building something with React, Next.js, or Shopify — let's talk.",
  links: [
    { label: "Email me", url: "mailto:a.agostini92@gmail.com" },
    { label: "LinkedIn", url: "https://linkedin.com/in/agostiniandrea" },
    { label: "GitHub", url: "https://github.com/agostiniandrea" },
  ],
};

export const minimalContact: ContactProps = {
  sectionLabel: "Contact",
  heading: "Get in touch",
  body: "Let's talk.",
  links: [{ label: "Email me", url: "mailto:a.agostini92@gmail.com" }],
};
