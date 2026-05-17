import { SiteHeaderProps } from "./index";

export const defaultSiteHeader: SiteHeaderProps = {
  logoText: "Andrea Agostini",
  navLinks: [
    { label: "Projects", url: "#projects" },
    { label: "Skills", url: "#skills" },
    { label: "Experience", url: "#experience" },
    { label: "Contact", url: "#contact" },
  ],
};

export const minimalSiteHeader: SiteHeaderProps = {
  logoText: "AA",
  navLinks: [],
};
