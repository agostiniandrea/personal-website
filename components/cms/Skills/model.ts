import { SkillsProps } from "./index";

export const defaultSkills: SkillsProps = {
  sectionLabel: "Skills",
  heading: "What I work with",
  categories: [
    {
      title: "Languages & Frameworks",
      skills: [
        "React",
        "Next.js",
        "TypeScript",
        "JavaScript",
        "Redux",
        "Vue.js",
      ],
    },
    {
      title: "Commerce & CMS",
      skills: [
        "Shopify",
        "BigCommerce",
        "Prismic",
        "Contentful",
        "Algolia",
        "headless WordPress",
      ],
    },
    {
      title: "Shopify App Stack",
      skills: ["Remix", "Prisma", "Shopify Polaris", "Liquid"],
    },
    {
      title: "Tooling & Testing",
      skills: [
        "Storybook",
        "Chromatic",
        "Jest",
        "Sentry",
        "Webpack",
        "Node.js",
        "Git",
      ],
    },
    {
      title: "Practices",
      skills: [
        "Frontend Architecture",
        "Design Systems",
        "Core Web Vitals",
        "WCAG 2.1 AA",
        "Tech Leadership",
      ],
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
