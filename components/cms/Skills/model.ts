import { SkillsProps } from "./index";

export const defaultSkills: SkillsProps = {
  sectionLabel: "Skills",
  heading: "What I work with",
  categories: [
    {
      title: "Frontend",
      skills: ["React", "Next.js", "TypeScript", "styled-components", "Storybook"],
    },
    {
      title: "Ecommerce",
      skills: ["Shopify", "Shopify Plus", "Storefront API", "Liquid", "Hydrogen"],
    },
    {
      title: "CMS & Data",
      skills: ["Contentful", "Prismic", "Algolia", "REST", "GraphQL"],
    },
    {
      title: "Tooling",
      skills: ["Vite", "Webpack", "ESLint", "Jest", "Vitest", "Playwright"],
    },
    {
      title: "Cloud & DevOps",
      skills: ["Vercel", "AWS", "GitHub Actions", "Sentry", "Chromatic"],
    },
    {
      title: "Design",
      skills: ["Figma", "Responsive Design", "Design Systems", "Core Web Vitals"],
    },
  ],
};

export const minimalSkills: SkillsProps = {
  sectionLabel: "Skills",
  heading: "What I work with",
  categories: [
    {
      title: "Frontend",
      skills: ["React", "Next.js", "TypeScript"],
    },
  ],
};
