import { ProjectsProps } from "./index";

export const defaultProjects: ProjectsProps = {
  sectionLabel: "Projects",
  heading: "What I've built",
  items: [
    {
      title: "Petite Revery",
      description:
        "High-end fashion ecommerce built on Next.js and Shopify Storefront API. Custom product configurator, size guides, and a fully bespoke checkout experience.",
      tags: ["Next.js", "TypeScript", "Shopify", "styled-components"],
      url: "https://petiterevery.com",
      urlLabel: "View project →",
    },
    {
      title: "7mesh Industries",
      description:
        "Performance cycling apparel brand. Headless Shopify storefront with custom collection filtering, Algolia search, and Storybook component library.",
      tags: ["Next.js", "TypeScript", "Shopify", "Algolia", "Storybook"],
      url: "https://7mesh.com",
      urlLabel: "View project →",
    },
    {
      title: "Nest Designs",
      description:
        "Baby and kids lifestyle brand. Shopify Plus storefront with subscription products, loyalty integration, and multi-currency support.",
      tags: ["Next.js", "TypeScript", "Shopify Plus", "Klaviyo"],
      url: "https://nestdesigns.com",
      urlLabel: "View project →",
    },
    {
      title: "Videoland",
      description:
        "Dutch video streaming platform. Led frontend architecture for the React rewrite from a legacy codebase, delivering live sports, series, and films.",
      tags: ["React", "TypeScript", "Redux", "Jest"],
    },
    {
      title: "Arfer",
      description:
        "B2B furniture configurator for architects and interior designers. Real-time 3D preview with a custom quote engine built on React and Three.js.",
      tags: ["React", "Three.js", "TypeScript"],
    },
    {
      title: "Sprintt Ceramica",
      description:
        "Ecommerce and product catalogue for an Italian ceramic tile manufacturer. Custom CMS integration and multi-language support.",
      tags: ["React", "Contentful", "i18n"],
    },
  ],
};

export const fewItemsProjects: ProjectsProps = {
  ...defaultProjects,
  items: defaultProjects.items.slice(0, 2),
};

export const noTagsProject: ProjectsProps = {
  ...defaultProjects,
  items: [
    {
      title: "Side Project",
      description: "A personal project with no tags or link.",
    },
  ],
};
