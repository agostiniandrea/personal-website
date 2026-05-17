import { SiteFooterProps } from "./index";

export const defaultSiteFooter: SiteFooterProps = {
  socialLinks: [
    { label: "LinkedIn", url: "https://linkedin.com/in/agostiniandrea" },
    { label: "GitHub", url: "https://github.com/agostiniandrea" },
  ],
  copyrightName: "Andrea Agostini",
};

export const minimalSiteFooter: SiteFooterProps = {
  socialLinks: [],
  copyrightName: "Andrea Agostini",
};
