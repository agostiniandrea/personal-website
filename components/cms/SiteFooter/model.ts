import { SiteFooterProps } from "./index";

export const defaultSiteFooter: SiteFooterProps = {
  socialLinks: [
    { label: "LinkedIn", url: "https://linkedin.com/in/agostiniandrea" },
    { label: "GitHub", url: "https://github.com/agostiniandrea" },
  ],
  copyrightName: "Andrea Agostini",
  tagline: "Building for the web, one component at a time. Based in Bangkok.",
};

export const minimalSiteFooter: SiteFooterProps = {
  socialLinks: [],
  copyrightName: "Andrea Agostini",
};
