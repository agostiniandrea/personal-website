import { ExperienceProps } from "./index";

export const defaultExperience: ExperienceProps = {
  sectionLabel: "Experience",
  heading: "Where I've worked",
  items: [
    {
      role: "Senior Frontend Developer & Tech Lead",
      company: "JIBE eCommerce",
      period: "2021 — Present",
      description:
        "Leading frontend development for headless Shopify storefronts across multiple clients. Architecting shared component libraries, design systems, and CI/CD pipelines. Clients include Petite Revery, 7mesh Industries, and Nest Designs.",
      tags: ["Next.js", "TypeScript", "Shopify", "styled-components", "Storybook"],
    },
    {
      role: "Senior Frontend Developer",
      company: "RTL Nederland — Videoland",
      period: "2019 — 2021",
      description:
        "Led the React rewrite of the Videoland streaming platform, migrating from a legacy codebase. Delivered live sports, series, and film experiences to millions of users across web and smart TV.",
      tags: ["React", "TypeScript", "Redux", "Jest"],
    },
    {
      role: "Frontend Developer",
      company: "Freelance",
      period: "2017 — 2019",
      description:
        "Delivered frontend projects for clients across ecommerce, automotive, and media. Key work includes Sprintt Ceramica and MOPAR Europe.",
      tags: ["React", "JavaScript", "WordPress"],
    },
    {
      role: "Frontend Developer",
      company: "Various agencies",
      period: "2013 — 2017",
      description:
        "Worked at several digital agencies in Milan, building interactive campaigns, brand sites, and online games. Clients included Fiat, Chrysler, and Arfer.",
      tags: ["JavaScript", "HTML", "CSS", "jQuery"],
    },
  ],
};

export const minimalExperience: ExperienceProps = {
  sectionLabel: "Experience",
  heading: "Where I've worked",
  items: [
    {
      role: "Senior Frontend Developer",
      company: "JIBE eCommerce",
      period: "2021 — Present",
      description: "Leading frontend development for headless Shopify storefronts.",
    },
  ],
};
