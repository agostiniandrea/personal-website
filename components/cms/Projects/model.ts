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
      title: "Videoland",
      description:
        "Dutch video streaming platform. Led frontend architecture for the React rewrite from a legacy codebase, delivering live sports, series, and films.",
      tags: ["React", "TypeScript", "Redux", "Jest"],
    },
  ],
};

export const fewItemsProjects: ProjectsProps = {
  ...defaultProjects,
  items: defaultProjects.items.slice(0, 1),
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
