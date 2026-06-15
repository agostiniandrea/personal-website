import { ProjectsProps } from "./index";

export const defaultProjects: ProjectsProps = {
  sectionLabel: "Projects",
  heading: "What I've built",
  items: [
    {
      title: "7mesh",
      description:
        "Long-term core developer on the headless storefront of 7mesh.com, a premium cycling apparel brand. Built PDP and PLP with faceted filtering, Algolia search, cart, and a full account section. Performance and WCAG 2.1 AA accessibility improvements ongoing since 2022.",
      tags: ["Next.js", "TypeScript", "Shopify", "Prismic", "Algolia", "Storybook"],
      url: "https://www.7mesh.com/",
      urlLabel: "View project →",
    },
    {
      title: "Compass",
      description:
        "Core contributor and maintainer of JIBE's internal design system, powering all of its headless ecommerce storefronts. Built core components, led React 19 and Next.js upgrade discovery, and strengthened tooling with Chromatic visual regression and automated dependency pipelines.",
      tags: ["React", "TypeScript", "Storybook", "styled-components", "Chromatic"],
      status: "internal",
    },
    {
      title: "Nest Designs",
      description:
        "Core developer on a headless Shopify storefront for a premium baby and kids sleepwear brand. Built an interactive size guide, faceted search with preserved scroll, BOPIS availability, and multi-currency support for AUD/GBP market launches.",
      tags: ["Next.js", "TypeScript", "Shopify", "Prismic", "Algolia", "Klaviyo"],
      url: "https://www.nestdesigns.com/",
      urlLabel: "View project →",
    },
    {
      title: "leggings.com",
      description:
        "Frontend development of the multi-vendor marketplace apps for leggings.com, in partnership with Orium. Built the merchant app for brand and product management and the admin app for moderation, smart collections, and category management.",
      tags: ["Shopify", "Remix", "Prisma", "Shopify Polaris", "TypeScript"],
      status: "pre-launch",
    },
    {
      title: "Kizi.nl",
      description:
        "Frontend architect and developer of Kizi.nl, Overstappen.nl's consumer comparison platform. Designed the stack alongside the CTO, built the site and app integrations, and coordinated developers and design decisions.",
      tags: ["Next.js", "TypeScript", "Redux", "Storybook", "Jest", "Azure DevOps"],
      url: "https://www.kizi.nl/",
      urlLabel: "View project →",
    },
    {
      title: "FCA Build & Price",
      description:
        "Built and maintained the Build & Price vehicle configurator for FCA Group's North American brand sites — Chrysler, Dodge, Jeep, Ram, Fiat and Alfa Romeo. Nearly three years of feature development on a high-traffic consumer tool with real-time pricing and availability.",
      tags: ["React", "Redux", "JavaScript", "Webpack", "Node.js"],
      url: "https://www.ramtrucks.com/en/lineup/?app=bmo&",
      urlLabel: "View project →",
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
